import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  futureSubmenu?: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly mobile = input(false);

  @Output() readonly requestClose = new EventEmitter<void>();

  protected readonly items: SidebarItem[] = [
    { id: 'home', label: 'Home', icon: 'home', active: true },
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'members', label: 'Membros', icon: 'groups' },
    { id: 'families', label: 'Famílias', icon: 'diversity_3' },
    { id: 'visitors', label: 'Visitantes', icon: 'person_add' },
    { id: 'baptisms', label: 'Batismos', icon: 'water_drop' },
    { id: 'transfers', label: 'Transferências', icon: 'swap_horiz' },
    { id: 'departments', label: 'Departamentos', icon: 'apartment', futureSubmenu: true },
    { id: 'ministries', label: 'Ministérios', icon: 'church', futureSubmenu: true },
    { id: 'leaderships', label: 'Lideranças', icon: 'workspace_premium' },
    { id: 'events', label: 'Eventos', icon: 'event' },
    { id: 'finance', label: 'Financeiro', icon: 'account_balance_wallet', futureSubmenu: true },
    { id: 'reports', label: 'Relatórios', icon: 'summarize', futureSubmenu: true },
    { id: 'users', label: 'Usuários', icon: 'manage_accounts', futureSubmenu: true },
    { id: 'settings', label: 'Configurações', icon: 'settings', futureSubmenu: true },
  ];

  notifyInteraction(): void {
    if (this.mobile()) {
      this.requestClose.emit();
    }
  }
}