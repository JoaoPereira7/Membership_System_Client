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
import { NgxMaskDirective } from 'ngx-mask';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { cpfValidator } from '../../../../core/validators/cpf.validator';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import { AccountProfileListItem } from '../../../AccountProfile/Models/account-profile.models';
import { AccountProfileService } from '../../../AccountProfile/Services/account-profile.service';
import { CreateAccountRequest, UpdateAccountRequest } from '../../Models/account.models';
import { AccountService } from '../../Services/account.service';
import { ChurchListItem } from '../../../Church/Models/church.models';
import { ChurchService } from '../../../Church/Services/church.service';
import { AccountDialogData, AccountDialogResult } from './account-dialog.types';

@Component({
  selector: 'app-account-dialog',
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
    NgxMaskDirective,
  ],
  templateUrl: './account-dialog.component.html',
  styleUrl: './account-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialogComponent {
  private readonly data = inject<AccountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<AccountDialogComponent, AccountDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(AccountService);
  private readonly accountProfileService = inject(AccountProfileService);
  private readonly churchService = inject(ChurchService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit ? 'Editar usuário' : 'Novo usuário';
  protected readonly saving = signal(false);
  protected readonly loadingProfiles = signal(true);
  protected readonly loadingChurches = signal(true);
  protected readonly profiles = signal<readonly AccountProfileListItem[]>([]);
  protected readonly churches = signal<readonly ChurchListItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: [this.item?.name ?? '', [Validators.required, nonBlankValidator()]],
    email: [this.item?.email ?? '', [Validators.required, Validators.email]],
    cpf: [
      this.item?.cpf ?? '',
      [Validators.required, Validators.pattern(/^\d{11}$/), cpfValidator()],
    ],
    password: [
      '',
      this.isEdit ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)],
    ],
    accountProfileId: [this.item?.accountProfileId ?? '', Validators.required],
    churchId: [this.item?.churchId ?? null],
    isActive: this.item?.isActive ?? true,
  });

  constructor() {
    this.accountProfileService
      .getAll(true)
      .pipe(
        finalize(() => this.loadingProfiles.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (profiles) => this.profiles.set(profiles),
        error: (error: unknown) => {
          const message = getApiErrorMessage(
            error,
            'Não foi possível carregar os perfis de acesso.',
          );
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });

    this.churchService
      .getAll()
      .pipe(
        finalize(() => this.loadingChurches.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (churches) => this.churches.set(churches),
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível carregar as igrejas.');
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
    if (this.saving()) {
      return;
    }

    this.form.markAllAsTouched();
    const name = this.form.controls.name.value.trim();
    const email = this.form.controls.email.value.trim();
    const cpf = this.form.controls.cpf.value.replace(/\D/g, '');
    const password = this.form.controls.password.value;
    this.form.patchValue({ name, email, cpf });

    if (this.form.invalid) {
      return;
    }

    const commonRequest = {
      name,
      email,
      cpf,
      accountProfileId: this.form.controls.accountProfileId.value,
      churchId: this.form.controls.churchId.value,
    };
    const operation = this.isEdit
      ? this.service.update(this.item!.id, {
          ...commonRequest,
          isActive: this.form.controls.isActive.value,
          ...(password ? { password } : {}),
        } satisfies UpdateAccountRequest)
      : this.service.create({
          ...commonRequest,
          password,
        } satisfies CreateAccountRequest);

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
            this.isEdit ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar o usuário.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private resolveItem() {
    if (this.data.mode === 'edit' && !this.data.item) {
      throw new Error('O usuário é obrigatório no modo de edição.');
    }

    return this.data.mode === 'edit' ? { ...this.data.item } : null;
  }
}
