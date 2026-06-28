import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  readonly pageTitle = input('Home');
  readonly breadcrumb = input<string[]>(['Home']);
  readonly collapsed = input(false);
  readonly mobile = input(false);
  readonly userName = input('João Pereira');

  @Output() readonly toggleSidebar = new EventEmitter<void>();
}