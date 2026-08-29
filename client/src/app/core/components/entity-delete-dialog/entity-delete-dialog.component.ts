import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map } from 'rxjs';
import { ApiResponse, getApiErrorMessage, unwrapApiData } from '../../api/api.models';
import { NotificationService } from '../../services/notification.service';

export interface EntityDeleteDialogData<TId extends string | number = string | number> {
  readonly endpoint: string;
  readonly id: TId;
  readonly entityLabel: string;
  readonly recordName: string;
}

@Component({
  selector: 'app-entity-delete-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './entity-delete-dialog.component.html',
  styleUrl: './entity-delete-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDeleteDialogComponent {
  protected readonly data = inject<EntityDeleteDialogData>(MAT_DIALOG_DATA);
  private readonly http = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<EntityDeleteDialogComponent, boolean>);
  private readonly notification = inject(NotificationService);
  protected readonly deleting = signal(false);

  protected delete(): void {
    if (this.deleting()) return;
    this.deleting.set(true);

    this.http
      .delete<ApiResponse<boolean>>(`${this.data.endpoint}/${encodeURIComponent(this.data.id)}`)
      .pipe(
        map((response) => unwrapApiData(response, `Não foi possível excluir ${this.data.entityLabel}.`)),
        finalize(() => this.deleting.set(false)),
      )
      .subscribe({
        next: () => {
          this.notification.success(`${this.data.entityLabel} excluído(a) com sucesso.`);
          this.dialogRef.close(true);
        },
        error: (error: unknown) =>
          this.notification.error(
            getApiErrorMessage(error, `Não foi possível excluir ${this.data.entityLabel}.`),
          ),
      });
  }
}
