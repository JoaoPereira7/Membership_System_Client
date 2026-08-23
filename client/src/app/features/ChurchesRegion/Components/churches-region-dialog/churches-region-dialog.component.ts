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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import {
  ChurchesRegionListItem,
  CreateChurchesRegionRequest,
  UpdateChurchesRegionRequest,
} from '../../Models/churches-region.models';
import { ChurchesRegionService } from '../../Services/churches-region.service';
import {
  ChurchesRegionDialogData,
  ChurchesRegionDialogResult,
} from './churches-region-dialog.types';

@Component({
  selector: 'app-churches-region-dialog',
  imports: [
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './churches-region-dialog.component.html',
  styleUrl: './churches-region-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChurchesRegionDialogComponent {
  private readonly data = inject<ChurchesRegionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ChurchesRegionDialogComponent, ChurchesRegionDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(ChurchesRegionService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit ? 'Editar região de igreja' : 'Nova região de igreja';
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: [
      this.item?.name ?? '',
      [Validators.required, Validators.maxLength(100), nonBlankValidator()],
    ],
    isActive: this.item?.isActive ?? true,
  });

  protected cancel(): void {
    if (!this.saving()) this.dialogRef.close({ saved: false });
  }

  protected save(): void {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    const name = this.form.controls.name.value.trim();
    this.form.controls.name.setValue(name);
    if (this.form.invalid) return;

    const operation = this.isEdit
      ? this.service.update(this.item!.id, {
          name,
          isActive: this.form.controls.isActive.value,
        } satisfies UpdateChurchesRegionRequest)
      : this.service.create({ name } satisfies CreateChurchesRegionRequest);

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
              ? 'Região de igreja atualizada com sucesso.'
              : 'Região de igreja cadastrada com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar a região de igreja.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private resolveItem(): ChurchesRegionListItem | null {
    if (this.data.mode === 'edit' && !this.data.item) {
      throw new Error('A região de igreja é obrigatória no modo de edição.');
    }
    return this.data.mode === 'edit' ? { ...this.data.item } : null;
  }
}
