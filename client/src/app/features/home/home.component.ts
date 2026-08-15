import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { HorizontalCarouselComponent } from './components/horizontal-carousel/horizontal-carousel.component';
import {
  FAMILY_VALUES,
  HISTORY_ITEMS,
  MORADA_NOVA_ITEMS,
  QUADRANGULAR_PILLARS,
  SYSTEM_SHORTCUTS,
} from './home.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, RouterLink, HorizontalCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly auth = inject(AuthService);

  protected readonly historyItems = HISTORY_ITEMS;
  protected readonly moradaNovaItems = MORADA_NOVA_ITEMS;
  protected readonly pillars = QUADRANGULAR_PILLARS;
  protected readonly familyValues = FAMILY_VALUES;
  protected readonly shortcuts = computed(() =>
    SYSTEM_SHORTCUTS.filter((shortcut) => this.auth.hasPermission(shortcut.permission)),
  );
}
