import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { MemberMembershipForm, MemberMembershipFormAddress } from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import {
  formatMemberCpf,
  formatMemberDate,
  formatMemberPhone,
  formatMemberZipCode,
} from '../../Utils/member-display-formatters';

@Component({
  selector: 'app-membership-form',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './membership-form.component.html',
  styleUrl: './membership-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MemberService);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly memberId = this.route.snapshot.paramMap.get('id');
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = signal<MemberMembershipForm | null>(null);
  protected readonly formatCpf = formatMemberCpf;
  protected readonly formatDate = formatMemberDate;
  protected readonly formatPhone = formatMemberPhone;
  protected readonly formatZipCode = formatMemberZipCode;

  constructor() {
    if (this.isBrowser) {
      this.document.body.classList.add('membership-form-page');
      this.destroyRef.onDestroy(() => this.document.body.classList.remove('membership-form-page'));
    }

    this.load();
  }

  protected load(): void {
    if (!this.memberId) {
      this.loading.set(false);
      this.errorMessage.set('Identificador do membro inválido.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.service
      .getMembershipForm(this.memberId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (form) => this.form.set(form),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Não foi possível carregar a ficha de membresia.'),
          ),
      });
  }

  protected back(): void {
    this.location.back();
  }

  protected print(): void {
    if (this.isBrowser) this.document.defaultView?.print();
  }

  protected display(value: string | null | undefined): string {
    return value?.trim() || 'Não informado';
  }

  protected addressLine(address: MemberMembershipFormAddress): string {
    return [address.street, address.number, address.complement]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part))
      .join(', ');
  }
}
