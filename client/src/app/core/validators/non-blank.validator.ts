import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nonBlankValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null =>
    control.value.trim().length > 0 ? null : { blank: true };
}
