export function formatMemberDate(value: string | null | undefined): string {
  if (!value) return 'Não informada';

  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function formatMemberCpf(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  const digits = value.replace(/\D/g, '');
  return digits.length === 11
    ? digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
    : value;
}

export function formatMemberPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return value;
}

export function formatMemberZipCode(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? digits.replace(/^(\d{5})(\d{3})$/, '$1-$2') : value;
}
