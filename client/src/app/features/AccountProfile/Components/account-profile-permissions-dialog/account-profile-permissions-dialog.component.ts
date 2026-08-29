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
  MINISTERIAL_TEAM_VIEW: 'Equipe Ministerial',
  CHURCH_VIEW: 'Igrejas',
  CHURCH_DEPARTMENT_VIEW: 'Departamentos por Igreja',
  CHURCHES_CATEGORY_VIEW: 'Categorias de Igrejas',
  CHURCHES_REGION_VIEW: 'Regiões de Igrejas',
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
const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] as const;
type PermissionAction = (typeof ACTIONS)[number];

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
  protected readonly actions = ACTIONS;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly permissions = signal<readonly PermissionApiDto[]>([]);
  protected readonly groups = computed(() => {
    const byResource = new Map<string, PermissionApiDto[]>();
    for (const permission of this.permissions()) {
      const resource = permission.normalizedName.replace(/_(VIEW|CREATE|UPDATE|DELETE)$/i, '');
      const group = byResource.get(resource) ?? [];
      group.push(permission);
      byResource.set(resource, group);
    }
    return [...byResource.entries()]
      .sort(([left], [right]) => {
        const leftIndex = SCREEN_ORDER.indexOf(`${left}_VIEW`);
        const rightIndex = SCREEN_ORDER.indexOf(`${right}_VIEW`);
        return (leftIndex < 0 ? SCREEN_ORDER.length : leftIndex) - (rightIndex < 0 ? SCREEN_ORDER.length : rightIndex);
      })
      .map(([resource, permissions]) => ({
        resource,
        label: SCREEN_LABELS[`${resource}_VIEW`] ?? resource,
        permissions,
      }));
  });
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

  protected permissionFor(resource: string, action: PermissionAction): PermissionApiDto | undefined {
    return this.permissions().find(
      (permission) => permission.normalizedName.toUpperCase() === `${resource}_${action}`,
    );
  }

  protected actionLabel(action: PermissionAction): string {
    return { VIEW: 'Visualizar', CREATE: 'Inserir', UPDATE: 'Atualizar', DELETE: 'Deletar' }[action];
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
