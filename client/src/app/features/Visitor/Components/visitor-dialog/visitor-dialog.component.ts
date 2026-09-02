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
import { NgxMaskDirective } from 'ngx-mask';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AppDatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import { ChurchListItem } from '../../../Church/Models/church.models';
import { ChurchService } from '../../../Church/Services/church.service';
import {
  CreateVisitorRequest,
  UpdateVisitorRequest,
  VisitorListItem,
} from '../../Models/visitor.models';
import { VisitorService } from '../../Services/visitor.service';
import { VisitorDialogData, VisitorDialogResult } from './visitor-dialog.types';

@Component({
  selector: 'app-visitor-dialog',
  imports: [
    A11yModule,
    ReactiveFormsModule,
    AppDatePickerComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgxMaskDirective,
  ],
  templateUrl: './visitor-dialog.component.html',
  styleUrl: './visitor-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorDialogComponent {
  private readonly data = inject<VisitorDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<VisitorDialogComponent, VisitorDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(VisitorService);
  private readonly churchService = inject(ChurchService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit ? 'Editar visitante' : 'Novo visitante';
  protected readonly saving = signal(false);
  protected readonly loadingChurches = signal(true);
  protected readonly churches = signal<readonly ChurchListItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: [
      this.item?.name ?? '',
      [Validators.required, nonBlankValidator(), Validators.maxLength(150)],
    ],
    phone: [
      this.item?.phone ?? '',
      [Validators.required, nonBlankValidator(), Validators.maxLength(20)],
    ],
    email: [this.item?.email ?? '', [Validators.email, Validators.maxLength(254)]],
    visitDate: [this.item?.visitDate.slice(0, 10) ?? this.today(), Validators.required],
    churchId: [this.item?.churchId ?? '', Validators.required],
  });

  constructor() {
    this.churchService
      .getAll()
      .pipe(
        finalize(() => this.loadingChurches.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (churches) => {
          const activeChurches = churches.filter((church) => church.isActive);
          this.churches.set(activeChurches);
          if (!this.isEdit && activeChurches.length === 1) {
            this.form.controls.churchId.setValue(activeChurches[0].id);
          }
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível carregar as igrejas.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  protected cancel(): void {
    if (!this.saving()) this.dialogRef.close({ saved: false });
  }

  protected save(): void {
    if (this.saving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const request = {
      name: value.name.trim(),
      phone: value.phone.trim(),
      email: value.email.trim() || null,
      visitDate: value.visitDate,
      churchId: value.churchId,
    };
    const operation = this.isEdit
      ? this.service.update(this.item!.id, request satisfies UpdateVisitorRequest)
      : this.service.create(request satisfies CreateVisitorRequest);

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
              ? 'Visitante atualizado com sucesso.'
              : 'Visitante cadastrado com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar o visitante.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private resolveItem(): VisitorListItem | null {
    return this.data.mode === 'edit' ? this.data.item : null;
  }

  private today(): string {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 10);
  }
}
