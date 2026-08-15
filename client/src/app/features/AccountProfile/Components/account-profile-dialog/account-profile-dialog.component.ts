import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import {
  CreateAccountProfileRequest,
  UpdateAccountProfileRequest,
  PermissionApiDto,
} from '../../Models/account-profile.models';
import { AccountProfileService } from '../../Services/account-profile.service';
import {
  AccountProfileDialogData,
  AccountProfileDialogResult,
} from './account-profile-dialog.types';

@Component({
  selector: 'app-account-profile-dialog',
  imports: [
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './account-profile-dialog.component.html',
  styleUrl: './account-profile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileDialogComponent {
  private readonly data = inject<AccountProfileDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<AccountProfileDialogComponent, AccountProfileDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly service = inject(AccountProfileService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = this.resolveItem();
  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly title = this.isEdit ? 'Editar perfil de acesso' : 'Novo perfil de acesso';
  protected readonly saving = signal(false);
  protected readonly loadingPermissions = signal(true);
  protected readonly permissions = signal<readonly PermissionApiDto[]>([]);
  protected readonly selectedPermissionIds = signal<ReadonlySet<string>>(new Set());
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: [
      this.item?.name ?? '',
      [Validators.required, Validators.maxLength(100), nonBlankValidator()],
    ],
    description: [this.item?.description ?? '', Validators.maxLength(300)],
    isActive: this.item?.isActive ?? true,
  });

  constructor() {
    forkJoin({
      permissions: this.service.getPermissions(),
      selectedIds: this.isEdit
        ? this.service.getProfilePermissionIds(this.item!.id)
        : of<readonly string[]>([]),
    })
      .pipe(
        finalize(() => this.loadingPermissions.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ permissions, selectedIds }) => {
          this.permissions.set(
            [...permissions].sort((left, right) =>
              left.normalizedName.localeCompare(right.normalizedName),
            ),
          );
          this.selectedPermissionIds.set(new Set(selectedIds));
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            getApiErrorMessage(error, 'Não foi possível carregar as permissões.'),
          );
        },
      });
  }

  protected cancel(): void {
    if (!this.saving()) {
      this.dialogRef.close({ saved: false });
    }
  }

  protected togglePermission(permissionId: string, checked: boolean): void {
    this.selectedPermissionIds.update((current) => {
      const next = new Set(current);
      checked ? next.add(permissionId) : next.delete(permissionId);
      return next;
    });
  }

  protected permissionLabel(permission: PermissionApiDto): string {
    return permission.normalizedName.replaceAll('_', ' ');
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }

    this.form.markAllAsTouched();
    const name = this.form.controls.name.value.trim();
    const description = this.form.controls.description.value.trim();
    this.form.patchValue({ name, description });

    if (this.form.invalid) {
      return;
    }

    const operation = this.isEdit
      ? this.service.update(this.item!.id, {
          name,
          description: description || null,
          isActive: this.form.controls.isActive.value,
        } satisfies UpdateAccountProfileRequest)
      : this.service.create({
          name,
          description: description || null,
          isActive: true,
        } satisfies CreateAccountProfileRequest);

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    operation
      .pipe(
        switchMap((item) =>
          this.service
            .replacePermissions(item.id, [...this.selectedPermissionIds()])
            .pipe(map(() => item)),
        ),
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
              ? 'Perfil de acesso atualizado com sucesso.'
              : 'Perfil de acesso cadastrado com sucesso.',
          );
          this.dialogRef.close({ saved: true, item });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar o perfil de acesso.');
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private resolveItem() {
    if (this.data.mode === 'edit' && !this.data.item) {
      throw new Error('O perfil de acesso é obrigatório no modo de edição.');
    }

    return this.data.mode === 'edit' ? { ...this.data.item } : null;
  }
}
