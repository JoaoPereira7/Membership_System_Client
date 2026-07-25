import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const cpf = control.value.replace(/\D/g, '');

    if (!cpf) {
      return null;
    }

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { cpf: true };
    }

    const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
    const secondDigit = calculateDigit(`${cpf.slice(0, 9)}${firstDigit}`, 11);

    return cpf.endsWith(`${firstDigit}${secondDigit}`) ? null : { cpf: true };
  };
}

function calculateDigit(digits: string, initialWeight: number): number {
  const sum = [...digits].reduce(
    (total, digit, index) => total + Number(digit) * (initialWeight - index),
    0,
  );
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}
