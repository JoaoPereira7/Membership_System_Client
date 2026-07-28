import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private activeMessage = '';
  private activeNotificationId = 0;
  private notificationVisible = false;

  success(message: string): void {
    this.open(message, 'success', 4000);
  }

  error(message: string): void {
    this.open(message, 'error', 5000);
  }

  warning(message: string): void {
    this.open(message, 'warning', 5000);
  }

  info(message: string): void {
    this.open(message, 'info', 4000);
  }

  private open(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number,
  ): void {
    const normalizedMessage = message.trim();
    if (!normalizedMessage || (this.notificationVisible && normalizedMessage === this.activeMessage)) {
      return;
    }

    const notificationId = ++this.activeNotificationId;
    this.activeMessage = normalizedMessage;
    this.notificationVisible = true;

    const snackBarRef = this.snackBar.open(normalizedMessage, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      politeness: type === 'error' ? 'assertive' : 'polite',
      panelClass: ['app-notification', `app-notification--${type}`],
    });

    snackBarRef.afterDismissed().subscribe(() => {
      if (notificationId === this.activeNotificationId) {
        this.activeMessage = '';
        this.notificationVisible = false;
      }
    });
  }
}
