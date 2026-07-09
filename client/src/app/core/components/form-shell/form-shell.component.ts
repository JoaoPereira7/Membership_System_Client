import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormShellAppearance, FormShellMode, FormShellModeViewModel } from './form-shell.types';

@Component({
  selector: 'app-form-shell',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './form-shell.component.html',
  styleUrl: './form-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFormShellComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly form = input.required<FormGroup>();
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly mode = input<FormShellMode>('create');
  readonly loading = input<boolean>(false);
  readonly saving = input<boolean>(false);
  readonly showCancel = input<boolean>(true);
  readonly showReset = input<boolean>(false);
  readonly submitLabel = input<string>('Salvar');
  readonly cancelLabel = input<string>('Cancelar');
  readonly resetLabel = input<string>('Limpar');
  readonly disableSubmitWhenPristine = input<boolean>(false);
  readonly appearance = input<FormShellAppearance>('card');
  readonly maxWidth = input<string>('100%');

  readonly formSubmit = output<void>();
  readonly cancelled = output<void>();
  readonly resetRequested = output<void>();

  readonly modeViewModel = computed<FormShellModeViewModel>(() => {
    switch (this.mode()) {
      case 'edit':
        return { label: 'Edição', icon: 'edit' };
      case 'view':
        return { label: 'Visualização', icon: 'visibility' };
      case 'create':
        return { label: 'Cadastro', icon: 'add_circle' };
    }
  });

  readonly isSubmitDisabled = computed<boolean>(() => {
    const form = this.form();

    return (
      this.saving() ||
      this.loading() ||
      form.disabled ||
      (this.disableSubmitWhenPristine() && form.pristine)
    );
  });

  readonly shellClasses = computed<readonly string[]>(() => [
    'form-shell',
    `form-shell--${this.appearance()}`,
    `form-shell--${this.mode()}`,
  ]);

  submit(): void {
    const form = this.form();
    form.markAllAsTouched();

    if (form.invalid) {
      this.focusFirstInvalidControl();
      return;
    }

    this.formSubmit.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  requestReset(): void {
    this.resetRequested.emit();
  }

  private focusFirstInvalidControl(): void {
    const host = this.elementRef.nativeElement;
    const invalidControl = host.querySelector<HTMLElement>(
      '.ng-invalid[formControlName], .ng-invalid[formControl], .mat-mdc-form-field-invalid input, .mat-mdc-form-field-invalid textarea, .mat-mdc-form-field-invalid select',
    );

    if (!invalidControl) {
      return;
    }

    invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    invalidControl.focus({ preventScroll: true });
  }
}