import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type StatCard = {
  label: string;
  value: string;
  icon: string;
  tone: 'primary' | 'secondary' | 'warning' | 'success';
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly stats: StatCard[] = [
    { label: 'Total de Membros', value: '1.248', icon: 'groups', tone: 'primary' },
    { label: 'Departamentos', value: '18', icon: 'apartment', tone: 'secondary' },
    { label: 'Congregações', value: '24', icon: 'church', tone: 'warning' },
    { label: 'Eventos', value: '86', icon: 'event', tone: 'success' },
  ];

  protected readonly shortcuts = [
    { label: 'Cadastrar membro', icon: 'person_add' },
    { label: 'Novo visitante', icon: 'group_add' },
    { label: 'Novo evento', icon: 'event_available' },
    { label: 'Relatórios', icon: 'description' },
  ];
}