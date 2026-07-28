import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { ApiResponse, getApiErrorMessage, unwrapApiData } from '../../api/api.models';
import { NotificationService } from '../../services/notification.service';

export interface EntityDetailsDialogData {
  readonly endpoint: string;
  readonly id: string;
  readonly title: string;
}

interface DetailItem {
  readonly label: string;
  readonly value: string;
}

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const labels: Readonly<Record<string, string>> = {
  name: 'Nome',
  description: 'Descrição',
  email: 'E-mail',
  cpf: 'CPF',
  rg: 'RG',
  birthDate: 'Data de nascimento',
  genderName: 'Gênero',
  maritalStatusName: 'Estado civil',
  nationality: 'Nacionalidade',
  motherName: 'Nome da mãe',
  fatherName: 'Nome do pai',
  isActive: 'Situação',
  isLeader: 'Líder',
  createdDate: 'Criado em',
  createdAt: 'Criado em',
  updateDate: 'Atualizado em',
  updatedDate: 'Atualizado em',
  updatedAt: 'Atualizado em',
  churchName: 'Igreja',
  churches: 'Igrejas',
  departmentName: 'Departamento',
  departmentNames: 'Departamentos',
  parentChurchName: 'Igreja sede',
  accountProfileName: 'Perfil de acesso',
  membershipStatusName: 'Situação da membresia',
  religiousOriginName: 'Origem religiosa',
  phoneTypeName: 'Tipo de telefone',
  addressTypeName: 'Tipo de endereço',
  educationLevelName: 'Escolaridade',
  formationAreaName: 'Área de formação',
  professionName: 'Profissão',
  churchRoleName: 'Cargo eclesiástico',
  leaderTypeName: 'Tipo de liderança',
  pastorName: 'Pastor',
  startDate: 'Data de início',
  endDate: 'Data de término',
  dateJoinedChurch: 'Data de ingresso na igreja',
  number: 'Número',
  phoneNumber: 'Telefone',
  zipCode: 'CEP',
  street: 'Logradouro',
  complement: 'Complemento',
  neighborhood: 'Bairro',
  city: 'Cidade',
  state: 'Estado',
  phones: 'Telefones',
  addresses: 'Endereços',
  member: 'Membro',
  membership: 'Membresia',
  membershipRoles: 'Cargos eclesiásticos',
  memberDepartments: 'Departamentos do membro',
  professionalInformation: 'Informações profissionais',
  leadership: 'Liderança',
};

@Component({
  selector: 'app-entity-details-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './entity-details-dialog.component.html',
  styleUrl: './entity-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailsDialogComponent {
  protected readonly data = inject<EntityDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly items = signal<readonly DetailItem[]>([]);

  constructor() {
    this.http
      .get<ApiResponse<Record<string, unknown>>>(
        `${this.data.endpoint}/${encodeURIComponent(this.data.id)}`,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const entity = unwrapApiData(response, 'Registro não encontrado.');
          this.items.set(this.toDetailItems(entity));
        },
        error: (error: unknown) =>
          this.notification.error(
            getApiErrorMessage(error, 'Não foi possível carregar os detalhes do registro.'),
          ),
      });
  }

  private toDetailItems(entity: Record<string, unknown>): readonly DetailItem[] {
    return Object.entries(entity)
      .filter(
        ([key, value]) =>
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !this.isIdentifierField(key, value),
      )
      .map(([key, value]) => ({
        label: labels[key] ?? this.humanize(key),
        value: this.formatValue(key, value),
      }));
  }

  private formatValue(key: string, value: unknown): string {
    if (typeof value === 'boolean') {
      return key === 'isActive' ? (value ? 'Ativo' : 'Inativo') : value ? 'Sim' : 'Não';
    }

    if (Array.isArray(value)) {
      return value.length ? value.map((item) => this.formatNested(item)).join(', ') : 'Nenhum';
    }

    if (typeof value === 'object') {
      return this.formatNested(value);
    }

    if (/date|created|updated/i.test(key) && typeof value === 'string') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleString('pt-BR');
    }

    return String(value);
  }

  private formatNested(value: unknown): string {
    if (!value || typeof value !== 'object') return String(value ?? '');
    const record = value as Record<string, unknown>;
    const preferredValue =
      record['name'] ??
      record['description'] ??
      record['departmentName'] ??
      record['churchName'] ??
      record['number'];

    if (preferredValue !== null && preferredValue !== undefined && preferredValue !== '') {
      return String(preferredValue);
    }

    const visibleValues = Object.entries(record)
      .filter(
        ([key, item]) =>
          item !== null &&
          item !== undefined &&
          item !== '' &&
          !this.isIdentifierField(key, item) &&
          typeof item !== 'object',
      )
      .map(([key, item]) => `${labels[key] ?? this.humanize(key)}: ${this.formatValue(key, item)}`);

    return visibleValues.length ? visibleValues.join(' · ') : 'Sem informações';
  }

  private isIdentifierField(key: string, value: unknown): boolean {
    if (key === 'normalizedName' || key === 'code') return true;

    const identifierKey =
      /^(id|ids|guid|guids)$/i.test(key) ||
      /(?:Id|Ids|Guid|Guids)$/.test(key) ||
      /(?:^|[_-])(?:id|ids|guid|guids)$/i.test(key);

    return identifierKey || (typeof value === 'string' && GUID_PATTERN.test(value));
  }

  private humanize(key: string): string {
    const text = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
