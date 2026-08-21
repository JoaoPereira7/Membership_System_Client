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
  ChurchDepartmentLookup,
  CompleteMember,
  CreateMemberDepartmentRequest,
  LookupItem,
  MemberDepartment,
} from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import {
  MemberDepartmentsDialogData,
  MemberDepartmentsDialogResult,
} from './member-departments-dialog.types';

const today = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

@Component({
  selector: 'app-member-departments-dialog',
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
  templateUrl: './member-departments-dialog.component.html',
  styleUrl: '../member-relations-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDepartmentsDialogComponent {
  protected readonly data = inject<MemberDepartmentsDialogData>(MAT_DIALOG_DATA);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly removingId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly member = signal<CompleteMember | null>(null);
  protected readonly departments = signal<readonly ChurchDepartmentLookup[]>([]);
  protected readonly leaderTypes = signal<readonly LookupItem[]>([]);

  protected readonly currentDepartments = computed<readonly MemberDepartment[]>(
    () => this.member()?.memberDepartments ?? [],
  );
  protected readonly availableDepartments = computed<readonly ChurchDepartmentLookup[]>(() => {
    const membership = this.member()?.membership;
    const assignedIds = new Set(
      this.currentDepartments().map((department) => department.churchDepartmentId),
    );
    return this.departments().filter(
      (department) =>
        department.churchId === membership?.churchId && !assignedIds.has(department.id),
    );
  });

  protected readonly form = new FormGroup({
    churchDepartmentId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    leaderTypeId: new FormControl('', {
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
    inject<MatDialogRef<MemberDepartmentsDialogComponent, MemberDepartmentsDialogResult>>(
      MatDialogRef,
    );
  private changed = false;

  constructor() {
    this.load();
  }

  protected departmentName(departmentId: string): string {
    return (
      this.departments().find((department) => department.id === departmentId)?.departmentName ??
      'Departamento não encontrado'
    );
  }

  protected leaderTypeName(leaderTypeId: string): string {
    return (
      this.leaderTypes().find((leaderType) => leaderType.id === leaderTypeId)?.name ??
      'Cargo não encontrado'
    );
  }

  protected save(): void {
    if (this.saving() || this.removingId()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const request = {
      churchDepartmentId: value.churchDepartmentId,
      leaderTypeId: value.leaderTypeId,
      startDate: value.startDate,
    } satisfies CreateMemberDepartmentRequest;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;
    this.service
      .createMemberDepartmentWithLeadership(this.data.memberId, request)
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
          this.form.reset({
            churchDepartmentId: '',
            leaderTypeId: '',
            startDate: today(),
          });
          this.notification.success('Departamento e cargo adicionados ao membro.');
        },
        error: (error: unknown) =>
          this.showError(getApiErrorMessage(error, 'Não foi possível adicionar o departamento.')),
      });
  }

  protected remove(department: MemberDepartment): void {
    if (!department.id || this.saving() || this.removingId()) {
      if (!department.id) this.showError('Não foi possível identificar o vínculo do departamento.');
      return;
    }

    this.confirmation
      .confirm({
        title: 'Remover departamento?',
        message: `O departamento “${this.departmentName(department.churchDepartmentId)}” e seu cargo serão removidos de ${this.data.memberName}.`,
        confirmLabel: 'Remover departamento',
        tone: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.removingId.set(department.id!);
          this.errorMessage.set(null);
          this.dialogRef.disableClose = true;
          return this.service.deleteMemberDepartment(department.id!).pipe(
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
          this.notification.success('Departamento removido do membro.');
        },
        error: (error: unknown) =>
          this.showError(getApiErrorMessage(error, 'Não foi possível remover o departamento.')),
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
      departments: this.service.getChurchDepartments(),
      leaderTypes: this.service.getLeaderTypes(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ member, departments, leaderTypes }) => {
          this.member.set(member);
          this.departments.set(departments);
          this.leaderTypes.set(leaderTypes);
        },
        error: (error: unknown) =>
          this.showError(
            getApiErrorMessage(error, 'Não foi possível carregar os departamentos deste membro.'),
          ),
      });
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    this.notification.error(message);
  }
}
