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
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import {
  ChurchListItem,
  CreateChurchRequest,
  UpdateChurchRequest,
} from '../../Models/church.models';
import { ChurchService } from '../../Services/church.service';
import { ChurchDialogData, ChurchDialogResult } from './church-dialog.types';

@Component({
  selector: 'app-church-dialog',
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
  templateUrl: './church-dialog.component.html',
  styleUrl: './church-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChurchDialogComponent {
  private readonly data = inject<ChurchDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ChurchDialogComponent, ChurchDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(ChurchService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit ? 'Editar igreja' : 'Nova igreja';
  protected readonly saving = signal(false);
  protected readonly loadingChurches = signal(true);
  protected readonly availableChurches = signal<readonly ChurchListItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: [
      this.item?.name ?? '',
      [Validators.required, Validators.maxLength(150), nonBlankValidator()],
    ],
    parentChurchId: this.formBuilder.control<string | null>(this.item?.parentChurchId ?? null),
    isActive: this.item?.isActive ?? true,
  });

  constructor() {
    this.service
      .getAll()
      .pipe(
        finalize(() => this.loadingChurches.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (churches) =>
          this.availableChurches.set(
            churches.filter((church) => !this.item || church.id !== this.item.id),
          ),
        error: (error: unknown) => {
          const message = getApiErrorMessage(
            error,
            'Não foi possível carregar as igrejas disponíveis.',
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
    const name = this.form.controls.name.value.trim();
    const parentChurchId = this.form.controls.parentChurchId.value;
    this.form.controls.name.setValue(name);

    if (this.item && parentChurchId === this.item.id) {
      this.form.controls.parentChurchId.setErrors({ selfReference: true });
    }

    if (this.form.invalid) return;

    const commonRequest = { name, parentChurchId };
    const operation = this.isEdit
      ? this.service.update(this.item!.id, {
          ...commonRequest,
          isActive: this.form.controls.isActive.value,
        } satisfies UpdateChurchRequest)
      : this.service.create(commonRequest satisfies CreateChurchRequest);

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
            this.isEdit ? 'Igreja atualizada com sucesso.' : 'Igreja cadastrada com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar a igreja.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private resolveItem(): ChurchListItem | null {
    if (this.data.mode === 'edit' && !this.data.item) {
      throw new Error('A igreja é obrigatória no modo de edição.');
    }
    return this.data.mode === 'edit' ? { ...this.data.item } : null;
  }
}
