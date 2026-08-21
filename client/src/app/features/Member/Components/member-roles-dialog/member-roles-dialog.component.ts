import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { filter, finalize, forkJoin, switchMap } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AppDatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  CompleteMember,
  CreateMembershipRoleRequest,
  LookupItem,
  MembershipRole,
} from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import { MemberRolesDialogData, MemberRolesDialogResult } from './member-roles-dialog.types';

const today = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

@Component({
  selector: 'app-member-roles-dialog',
  imports: [
    ReactiveFormsModule,
    AppDatePickerComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './member-roles-dialog.component.html',
  styleUrl: '../member-relations-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberRolesDialogComponent {
  protected readonly data = inject<MemberRolesDialogData>(MAT_DIALOG_DATA);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly removingId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly member = signal<CompleteMember | null>(null);
  protected readonly roles = signal<readonly LookupItem[]>([]);

  protected readonly currentRoles = computed<readonly MembershipRole[]>(
    () => this.member()?.membershipRoles ?? [],
  );
  protected readonly availableRoles = computed<readonly LookupItem[]>(() => {
    const assignedIds = new Set(this.currentRoles().map((role) => role.churchRoleId));
    return this.roles().filter((role) => !assignedIds.has(role.id));
  });

  protected readonly form = new FormGroup({
    churchRoleId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl(today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly service = inject(MemberService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef =
    inject<MatDialogRef<MemberRolesDialogComponent, MemberRolesDialogResult>>(MatDialogRef);
  private changed = false;

  constructor() {
    this.load();
  }

  protected roleName(roleId: string): string {
    return this.roles().find((role) => role.id === roleId)?.name ?? 'Cargo não encontrado';
  }

  protected save(): void {
    if (this.saving() || this.removingId()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const request = {
      churchRoleId: this.form.controls.churchRoleId.value,
      startDate: this.form.controls.startDate.value,
    } satisfies CreateMembershipRoleRequest;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;
    this.service
      .createMembershipRole(this.data.memberId, request)
      .pipe(
        switchMap(() => this.service.getById(this.data.memberId)),
        finalize(() => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (member) => {
          this.member.set(member);
          this.changed = true;
          this.form.reset({ churchRoleId: '', startDate: today() });
          this.notification.success('Cargo eclesiástico adicionado ao membro.');
        },
        error: (error: unknown) =>
          this.showError(getApiErrorMessage(error, 'Não foi possível adicionar o cargo.')),
      });
  }

  protected remove(role: MembershipRole): void {
    if (!role.id || this.saving() || this.removingId()) {
      if (!role.id) this.showError('Não foi possível identificar o vínculo do cargo.');
      return;
    }

    this.confirmation
      .confirm({
        title: 'Remover cargo eclesiástico?',
        message: `O cargo “${this.roleName(role.churchRoleId)}” será removido de ${this.data.memberName}.`,
        confirmLabel: 'Remover cargo',
        tone: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.removingId.set(role.id!);
          this.errorMessage.set(null);
          this.dialogRef.disableClose = true;
          return this.service.deleteMembershipRole(role.id!).pipe(
            switchMap(() => this.service.getById(this.data.memberId)),
            finalize(() => {
              this.removingId.set(null);
              this.dialogRef.disableClose = false;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (member) => {
          this.member.set(member);
          this.changed = true;
          this.notification.success('Cargo eclesiástico removido do membro.');
        },
        error: (error: unknown) =>
          this.showError(getApiErrorMessage(error, 'Não foi possível remover o cargo.')),
      });
  }

  protected close(): void {
    if (!this.saving() && !this.removingId()) {
      this.dialogRef.close({ changed: this.changed });
    }
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Não informada';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    forkJoin({
      member: this.service.getById(this.data.memberId),
      roles: this.service.getChurchRoles(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ member, roles }) => {
          this.member.set(member);
          this.roles.set(roles);
        },
        error: (error: unknown) =>
          this.showError(
            getApiErrorMessage(error, 'Não foi possível carregar os cargos deste membro.'),
          ),
      });
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    this.notification.error(message);
  }
}
