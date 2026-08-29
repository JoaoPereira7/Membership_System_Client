import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { EntityDetailsDialogData } from '../../../../core/components/entity-details-dialog/entity-details-dialog.component';
import { FullMember } from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';

@Component({
  selector: 'app-member-details-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  templateUrl: './member-details-dialog.component.html',
  styleUrl: './member-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailsDialogComponent {
  protected readonly data = inject<EntityDetailsDialogData<string>>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<MemberDetailsDialogComponent>>(MatDialogRef);
  private readonly service = inject(MemberService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly details = signal<FullMember | null>(null);
  protected readonly stepIndex = signal(0);
  protected readonly lastStepIndex = 5;
  private readonly stepper = viewChild.required<MatStepper>('stepper');

  constructor() {
    this.dialogRef.updateSize('960px');
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.service
      .getFullById(this.data.id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (details) => this.details.set(details),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Não foi possível carregar os detalhes do membro.'),
          ),
      });
  }

  protected previous(): void {
    this.stepper().previous();
  }

  protected next(): void {
    this.stepper().next();
  }

  protected display(value: string | null | undefined): string {
    return value?.trim() || 'Não informado';
  }

  protected status(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  protected formatDate(value: string | null | undefined): string {
    if (!value) return 'Não informada';

    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  protected formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11
      ? digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
      : value;
  }

  protected formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    return value;
  }

  protected formatZipCode(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length === 8 ? digits.replace(/^(\d{5})(\d{3})$/, '$1-$2') : value;
  }
}
