import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, forkJoin } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChurchListItem } from '../../../Church/Models/church.models';
import { ChurchService } from '../../../Church/Services/church.service';
import { DepartmentListItem } from '../../../Department/Models/department.models';
import { DepartmentService } from '../../../Department/Services/department.service';
import {
  ChurchDepartmentListItem,
  CreateChurchDepartmentRequest,
  UpdateChurchDepartmentRequest,
} from '../../Models/church-department.models';
import { ChurchDepartmentService } from '../../Services/church-department.service';
import {
  ChurchDepartmentDialogData,
  ChurchDepartmentDialogResult,
} from './church-department-dialog.types';

@Component({
  selector: 'app-church-department-dialog',
  imports: [
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './church-department-dialog.component.html',
  styleUrl: './church-department-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChurchDepartmentDialogComponent {
  private readonly data = inject<ChurchDepartmentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ChurchDepartmentDialogComponent, ChurchDepartmentDialogResult>>(
      MatDialogRef,
    );
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(ChurchDepartmentService);
  private readonly churchService = inject(ChurchService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit
    ? 'Editar departamento da igreja'
    : 'Novo departamento da igreja';
  protected readonly saving = signal(false);
  protected readonly loadingOptions = signal(true);
  protected readonly churches = signal<readonly ChurchListItem[]>([]);
  protected readonly departments = signal<readonly DepartmentListItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    churchId: [this.item?.churchId ?? '', Validators.required],
    departmentId: [this.item?.departmentId ?? '', Validators.required],
    startDate: [this.item?.startDate.slice(0, 10) ?? this.today(), Validators.required],
    isActive: this.item?.isActive ?? true,
  });

  constructor() {
    forkJoin({
      churches: this.churchService.getAll(),
      departments: this.departmentService.getAll(),
    })
      .pipe(
        finalize(() => this.loadingOptions.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: ({ churches, departments }) => {
          this.churches.set(churches.filter((church) => church.isActive));
          this.departments.set(departments.filter((department) => department.isActive));
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(
            error,
            'Não foi possível carregar igrejas e departamentos.',
          );
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  protected cancel(): void {
    if (!this.saving()) {
      this.dialogRef.close({ saved: false });
    }
  }

  protected save(): void {
    if (this.saving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const commonRequest = {
      churchId: this.form.controls.churchId.value,
      departmentId: this.form.controls.departmentId.value,
      startDate: this.form.controls.startDate.value,
    };
    const operation = this.isEdit
      ? this.service.update(this.item!.id, {
          ...commonRequest,
          isActive: this.form.controls.isActive.value,
        } satisfies UpdateChurchDepartmentRequest)
      : this.service.create(commonRequest satisfies CreateChurchDepartmentRequest);

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    operation
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.notification.success(
            this.isEdit
              ? 'Departamento da igreja atualizado com sucesso.'
              : 'Departamento vinculado à igreja com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(
            error,
            'Não foi possível salvar o departamento da igreja.',
          );
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private today(): string {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 10);
  }

  private resolveItem(): ChurchDepartmentListItem | null {
    if (this.data.mode === 'edit' && !this.data.item) {
      throw new Error('O vínculo é obrigatório no modo de edição.');
    }
    return this.data.mode === 'edit' ? { ...this.data.item } : null;
  }
}
