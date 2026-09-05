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
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { EntityDetailsDialogData } from '../../../../core/components/entity-details-dialog/entity-details-dialog.component';
import { FullMember } from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import {
  formatMemberCpf,
  formatMemberDate,
  formatMemberPhone,
  formatMemberZipCode,
} from '../../Utils/member-display-formatters';

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
  private readonly router = inject(Router);
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

  protected openMembershipForm(): void {
    this.dialogRef.close();
    void this.router.navigate(['/members', this.data.id, 'membership-form']);
  }

  protected display(value: string | null | undefined): string {
    return value?.trim() || 'Não informado';
  }

  protected status(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  protected readonly formatDate = formatMemberDate;
  protected readonly formatCpf = formatMemberCpf;
  protected readonly formatPhone = formatMemberPhone;
  protected readonly formatZipCode = formatMemberZipCode;
}
