import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermissionApiDto } from '../../Models/account-profile.models';
import { AccountProfileService } from '../../Services/account-profile.service';
import {
  AccountProfilePermissionsDialogData,
  AccountProfilePermissionsDialogResult,
} from './account-profile-permissions-dialog.types';

const SCREEN_LABELS: Readonly<Record<string, string>> = {
  DASHBOARD_VIEW: 'Início / Dashboard',
  MEMBER_VIEW: 'Membros',
  CHURCH_VIEW: 'Igrejas',
  CHURCH_DEPARTMENT_VIEW: 'Departamentos por Igreja',
  ACCOUNT_VIEW: 'Usuários',
  ACCOUNT_PROFILE_VIEW: 'Perfis de acesso',
  GENDER_VIEW: 'Gêneros',
  MARITAL_STATUS_VIEW: 'Estados civis',
  ADDRESS_TYPE_VIEW: 'Tipos de endereço',
  PHONE_TYPE_VIEW: 'Tipos de telefone',
  EDUCATION_LEVEL_VIEW: 'Níveis de escolaridade',
  FORMATION_AREA_VIEW: 'Áreas de formação',
  PROFESSION_VIEW: 'Profissões',
  MEMBERSHIP_STATUS_VIEW: 'Situações da membresia',
  RELIGIOUS_ORIGIN_VIEW: 'Origens religiosas',
  LEADER_TYPE_VIEW: 'Tipos de liderança',
  DEPARTMENT_VIEW: 'Departamentos',
  CHURCH_ROLE_VIEW: 'Cargos eclesiásticos',
};

const SCREEN_ORDER = Object.keys(SCREEN_LABELS);

@Component({
  selector: 'app-account-profile-permissions-dialog',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-profile-permissions-dialog.component.html',
  styleUrl: './account-profile-permissions-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfilePermissionsDialogComponent {
  private readonly data = inject<AccountProfilePermissionsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<
    MatDialogRef<
      AccountProfilePermissionsDialogComponent,
      AccountProfilePermissionsDialogResult
    >
  >(MatDialogRef);
  private readonly service = inject(AccountProfileService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly profile = this.data.profile;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly permissions = signal<readonly PermissionApiDto[]>([]);
  protected readonly selectedPermissionIds = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedCount = computed(() => this.selectedPermissionIds().size);
  protected readonly allSelected = computed(
    () =>
      this.permissions().length > 0 &&
      this.permissions().every((permission) => this.selectedPermissionIds().has(permission.id)),
  );

  constructor() {
    forkJoin({
      permissions: this.service.getPermissions(),
      selectedIds: this.service.getProfilePermissionIds(this.profile.id),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ permissions, selectedIds }) => {
          const orderedPermissions = [...permissions].sort(
            (left, right) => this.screenOrder(left) - this.screenOrder(right),
          );
          const availableIds = new Set(orderedPermissions.map((permission) => permission.id));

          this.permissions.set(orderedPermissions);
          this.selectedPermissionIds.set(
            new Set(selectedIds.filter((permissionId) => availableIds.has(permissionId))),
          );
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            getApiErrorMessage(error, 'Não foi possível carregar as permissões do perfil.'),
          );
        },
      });
  }

  protected permissionLabel(permission: PermissionApiDto): string {
    return SCREEN_LABELS[permission.normalizedName.toUpperCase()] ?? permission.name;
  }

  protected togglePermission(permissionId: string, checked: boolean): void {
    this.selectedPermissionIds.update((current) => {
      const next = new Set(current);
      checked ? next.add(permissionId) : next.delete(permissionId);
      return next;
    });
  }

  protected toggleAll(): void {
    this.selectedPermissionIds.set(
      this.allSelected()
        ? new Set()
        : new Set(this.permissions().map((permission) => permission.id)),
    );
  }

  protected cancel(): void {
    if (!this.saving()) {
      this.dialogRef.close({ saved: false });
    }
  }

  protected save(): void {
    if (this.loading() || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    this.service
      .replacePermissions(this.profile.id, [...this.selectedPermissionIds()])
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notification.success('Permissões do perfil atualizadas com sucesso.');
          this.dialogRef.close({ saved: true });
        },
        error: (error: unknown) => {
          const message = getApiErrorMessage(
            error,
            'Não foi possível atualizar as permissões do perfil.',
          );
          this.errorMessage.set(message);
          this.notification.error(message);
        },
      });
  }

  private screenOrder(permission: PermissionApiDto): number {
    const index = SCREEN_ORDER.indexOf(permission.normalizedName.toUpperCase());
    return index === -1 ? SCREEN_ORDER.length : index;
  }
}
