import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { EntityDetailsDialogData } from '../../../../core/components/entity-details-dialog/entity-details-dialog.component';
import { ChurchListItem } from '../../Models/church.models';
import { ChurchService } from '../../Services/church.service';

@Component({
  selector: 'app-church-details-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './church-details-dialog.component.html',
  styleUrl: './church-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChurchDetailsDialogComponent {
  protected readonly data = inject<EntityDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(ChurchService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly church = signal<ChurchListItem | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.service
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (churches) => {
          const church = churches.find((item) => item.id === this.data.id) ?? null;
          this.church.set(church);
          if (!church) this.errorMessage.set('Igreja não encontrada.');
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Não foi possível carregar os detalhes da igreja.'),
          ),
      });
  }

  protected display(value: string | null | undefined): string {
    return value?.trim() || '-';
  }

  protected status(active: boolean): string {
    return active ? 'Ativa' : 'Inativa';
  }
}
