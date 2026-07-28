import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmationOptions {
  readonly title?: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly tone?: 'warning' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private readonly dialog = inject(MatDialog);

  confirm(options: ConfirmationOptions): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: options.title ?? 'Confirmar ação',
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Confirmar',
      cancelLabel: options.cancelLabel ?? 'Cancelar',
      tone: options.tone ?? 'warning',
    };

    return this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(
        ConfirmationDialogComponent,
        {
          data,
          width: '440px',
          maxWidth: 'calc(100vw - 2rem)',
          autoFocus: false,
          restoreFocus: true,
          role: 'alertdialog',
          panelClass: 'confirmation-dialog-panel',
        },
      )
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
