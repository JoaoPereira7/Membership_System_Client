import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GlobalAction, GlobalActionsData } from './global-actions.types';

@Component({
  selector: 'app-global-actions',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
  templateUrl: './global-actions.component.html',
  styleUrl: './global-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppGlobalActionsComponent {
  protected readonly data = inject<GlobalActionsData>(MAT_DIALOG_DATA);
  protected readonly pendingAction = signal<GlobalAction | null>(null);
  protected readonly title = this.data.title?.trim() || 'Ações em lote';
  protected readonly itemLabel = this.data.itemLabel?.trim() || 'registro(s)';
  protected readonly formattedItemCount = new Intl.NumberFormat('pt-BR').format(
    Math.max(0, this.data.itemCount),
  );
  protected readonly confirmationMessage = computed(
    () => this.data.confirmationMessage?.trim() || null,
  );

  private readonly dialogRef = inject(MatDialogRef<AppGlobalActionsComponent, string | null>);

  protected execute(action: GlobalAction): void {
    if (!action.disabled) {
      this.pendingAction.set(action);
    }
  }

  protected confirm(): void {
    const action = this.pendingAction();
    if (action) {
      this.dialogRef.close(action.command);
    }
  }

  protected back(): void {
    this.pendingAction.set(null);
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }
}
