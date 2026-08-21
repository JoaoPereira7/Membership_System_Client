import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DatePickerErrorMessages } from './date-picker.types';

const DEFAULT_ERROR_MESSAGES: DatePickerErrorMessages = {
  required: 'Campo obrigatório.',
  future: 'A data não pode ser futura.',
  beforeStart: 'Deve ser posterior à data inicial.',
  matDatepickerMin: 'Data anterior ao mínimo permitido.',
  matDatepickerMax: 'Data posterior ao máximo permitido.',
  matDatepickerParse: 'Data inválida.',
};

function parseIsoDate(value: string): Date | null {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date | null): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-date-picker',
  imports: [ReactiveFormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDatePickerComponent implements ControlValueAccessor, DoCheck {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  readonly label = input.required<string>();
  readonly placeholder = input<string>('dd/mm/aaaa');
  readonly hint = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly errorMessages = input<DatePickerErrorMessages>({});

  protected readonly value = signal<Date | null>(null);
  protected readonly disabled = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly minDate = computed(() => (this.min() ? parseIsoDate(this.min()!) : null));
  protected readonly maxDate = computed(() => (this.max() ? parseIsoDate(this.max()!) : null));

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Register directly to avoid the NG_VALUE_ACCESSOR <-> NgControl injection cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control;
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      this.errorMessage.set(null);
      return;
    }

    const messages = { ...DEFAULT_ERROR_MESSAGES, ...this.errorMessages() };
    const key = Object.keys(control.errors ?? {}).find((errorKey) => messages[errorKey]);
    this.errorMessage.set(key ? messages[key] : null);
  }

  writeValue(value: string | null): void {
    this.value.set(value ? parseIsoDate(value) : null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onDateChange(date: Date | null): void {
    this.value.set(date);
    this.onChange(toIsoDate(date));
    this.onTouched();
  }

  protected touch(): void {
    this.onTouched();
  }
}
