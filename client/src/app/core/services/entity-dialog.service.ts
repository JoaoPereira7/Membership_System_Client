import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EntityDeleteDialogComponent,
  EntityDeleteDialogData,
} from '../components/entity-delete-dialog/entity-delete-dialog.component';
import {
  EntityDetailsDialogComponent,
  EntityDetailsDialogData,
} from '../components/entity-details-dialog/entity-details-dialog.component';

export interface EntityDialogOptions {
  readonly endpoint: string;
  readonly id: string;
  readonly title: string;
  readonly entityLabel: string;
  readonly recordName: string;
}

@Injectable({ providedIn: 'root' })
export class EntityDialogService {
  private readonly dialog = inject(MatDialog);

  openDetails(options: EntityDialogOptions): void {
    const data: EntityDetailsDialogData = {
      endpoint: this.endpoint(options.endpoint),
      id: options.id,
      title: options.title,
    };

    this.dialog.open(EntityDetailsDialogComponent, {
      data,
      width: '680px',
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: 'calc(100dvh - 2rem)',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'entity-details-dialog-panel',
    });
  }

  openDelete(options: EntityDialogOptions): Observable<boolean | undefined> {
    const data: EntityDeleteDialogData = {
      endpoint: this.endpoint(options.endpoint),
      id: options.id,
      entityLabel: options.entityLabel,
      recordName: options.recordName,
    };

    return this.dialog
      .open<EntityDeleteDialogComponent, EntityDeleteDialogData, boolean>(
        EntityDeleteDialogComponent,
        {
          data,
          width: '480px',
          maxWidth: 'calc(100vw - 2rem)',
          disableClose: true,
          autoFocus: false,
          restoreFocus: true,
          panelClass: 'entity-delete-dialog-panel',
        },
      )
      .afterClosed();
  }

  private endpoint(path: string): string {
    return `${environment.apiBaseUrl}/${path}`;
  }
}
