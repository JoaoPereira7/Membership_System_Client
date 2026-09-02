import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { VisitorListItem } from '../../Models/visitor.models';
import { VisitorService } from '../../Services/visitor.service';

@Component({
  selector: 'app-visitor-details-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './visitor-details-dialog.component.html',
  styleUrl: './visitor-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorDetailsDialogComponent {
  private readonly visitorData = inject<VisitorListItem>(MAT_DIALOG_DATA);
  private readonly service = inject(VisitorService);
  private readonly notification = inject(NotificationService);

  protected readonly visitor = signal<VisitorListItem>(this.visitorData);
  protected readonly loading = signal(true);

  constructor() {
    this.service
      .getById(this.visitorData.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (visitor) => this.visitor.set(visitor),
        error: (error: unknown) =>
          this.notification.error(
            getApiErrorMessage(error, 'Não foi possível carregar os detalhes do visitante.'),
          ),
      });
  }

  protected display(value: string | null | undefined): string {
    return value?.trim() || 'Não informado';
  }
}
