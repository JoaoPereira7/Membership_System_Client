import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
  UpdateMemberDepartmentRequest,
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
    MatCheckboxModule,
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
  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  protected readonly data = inject<MemberDepartmentsDialogData>(MAT_DIALOG_DATA);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly removingId = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly member = signal<CompleteMember | null>(null);
  protected readonly departments = signal<readonly ChurchDepartmentLookup[]>([]);
  protected readonly leaderTypes = signal<readonly LookupItem[]>([]);

  protected readonly currentDepartments = computed<readonly MemberDepartment[]>(() =>
    (this.member()?.memberDepartments ?? []).filter((department) => department.activeParticipant),
  );
  protected readonly availableDepartments = computed<readonly ChurchDepartmentLookup[]>(() => {
    const membership = this.member()?.membership;
    const editingId = this.editingId();
    const assignedIds = new Set(
      this.currentDepartments()
        .filter((department) => department.id !== editingId)
        .map((department) => department.churchDepartmentId),
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
    startDate: new FormControl(today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl<string | null>(null),
    activeParticipant: new FormControl(true, { nonNullable: true }),
    isLeader: new FormControl(false, { nonNullable: true }),
    leaderTypeId: new FormControl<string | null>(null),
    leadershipStartDate: new FormControl<string | null>(null),
    leadershipEndDate: new FormControl<string | null>(null),
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
    this.form.controls.isLeader.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLeader) => this.configureLeadershipFields(isLeader));
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

  protected edit(department: MemberDepartment): void {
    if (!department.id || this.saving() || this.removingId()) return;
    this.editingId.set(department.id);
    this.errorMessage.set(null);
    this.resetFormState({
      churchDepartmentId: department.churchDepartmentId,
      startDate: department.startDate.slice(0, 10),
      endDate: department.endDate?.slice(0, 10) ?? null,
      activeParticipant: department.activeParticipant,
      isLeader: !!department.leadership,
      leaderTypeId: department.leadership?.leaderTypeId ?? null,
      leadershipStartDate: department.leadership?.startDate.slice(0, 10) ?? null,
      leadershipEndDate: department.leadership?.endDate?.slice(0, 10) ?? null,
    });
  }

  protected cancelEdit(): void {
    if (this.saving()) return;
    this.resetForm();
  }

  protected save(): void {
    if (this.saving() || this.removingId()) {
      return;
    }

    const startDate = this.form.controls.startDate.value;
    const endDate = this.form.controls.endDate.value;
    this.form.controls.endDate.setErrors(
      endDate && endDate < startDate ? { beforeStart: true } : null,
    );
    const leadershipStartDate = this.form.controls.leadershipStartDate.value;
    const leadershipEndDate = this.form.controls.leadershipEndDate.value;
    this.form.controls.leadershipEndDate.setErrors(
      this.form.controls.isLeader.value &&
        leadershipEndDate &&
        leadershipStartDate &&
        leadershipEndDate < leadershipStartDate
        ? { beforeStart: true }
        : this.form.controls.isLeader.value &&
            leadershipEndDate &&
            endDate &&
            leadershipEndDate > endDate
          ? { afterDepartmentEnd: true }
          : null,
    );
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const request = {
      churchDepartmentId: value.churchDepartmentId,
      startDate,
      leaderTypeId: value.isLeader ? value.leaderTypeId : null,
      leadershipStartDate: value.isLeader ? value.leadershipStartDate : null,
    } satisfies CreateMemberDepartmentRequest;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;
    const editingId = this.editingId();
    const operation = editingId
      ? this.service.updateMemberDepartment(this.data.memberId, editingId, {
          ...request,
          endDate,
          activeParticipant: !endDate && value.activeParticipant,
          leadershipEndDate: value.isLeader ? value.leadershipEndDate : null,
        } satisfies UpdateMemberDepartmentRequest)
      : this.service.createMemberDepartmentWithLeadership(this.data.memberId, request);
    operation
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
          this.resetForm();
          this.notification.success(
            editingId
              ? 'Departamento atualizado com sucesso.'
              : 'Departamento adicionado ao membro.',
          );
        },
        error: (error: unknown) =>
          this.showError(
            getApiErrorMessage(
              error,
              editingId
                ? 'Não foi possível atualizar o departamento.'
                : 'Não foi possível adicionar o departamento.',
            ),
          ),
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
        message: `O departamento “${this.departmentName(department.churchDepartmentId)}” será removido de ${this.data.memberName}.`,
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
          if (this.editingId() === department.id) this.resetForm();
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

  private configureLeadershipFields(isLeader: boolean): void {
    const leaderType = this.form.controls.leaderTypeId;
    const leadershipStartDate = this.form.controls.leadershipStartDate;
    const leadershipEndDate = this.form.controls.leadershipEndDate;
    if (isLeader) {
      leaderType.setValidators(Validators.required);
      leadershipStartDate.setValidators(Validators.required);
      if (!leadershipStartDate.value) leadershipStartDate.setValue(today());
    } else {
      leaderType.clearValidators();
      leadershipStartDate.clearValidators();
      leaderType.setValue(null);
      leadershipStartDate.setValue(null);
      leadershipEndDate.setValue(null);
    }
    leaderType.updateValueAndValidity({ emitEvent: false });
    leadershipStartDate.updateValueAndValidity({ emitEvent: false });
    leadershipEndDate.updateValueAndValidity({ emitEvent: false });
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.resetFormState({
      churchDepartmentId: '',
      startDate: today(),
      endDate: null,
      activeParticipant: true,
      isLeader: false,
      leaderTypeId: null,
      leadershipStartDate: null,
      leadershipEndDate: null,
    });
  }

  private resetFormState(value: {
    churchDepartmentId: string;
    startDate: string;
    endDate: string | null;
    activeParticipant: boolean;
    isLeader: boolean;
    leaderTypeId: string | null;
    leadershipStartDate: string | null;
    leadershipEndDate: string | null;
  }): void {
    if (this.formDirective) this.formDirective.resetForm(value);
    else this.form.reset(value);
  }
}
