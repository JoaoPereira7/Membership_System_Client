import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
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
  imports: [MatButtonModule, MatIconModule, MatRippleModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly mobile = input(false);

  @Output() readonly requestClose = new EventEmitter<void>();
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  protected readonly items: SidebarItem[] = [
    { id: 'home', label: 'Home', icon: 'home', active: true },
  ];

  notifyInteraction(): void {
    if (this.mobile()) {
      this.requestClose.emit();
    }
  }

  handleToggleClick(): void {
    this.toggleSidebar.emit();
  }
}