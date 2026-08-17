export type MemberDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly memberId: string };

export interface MemberDialogResult {
  readonly saved: boolean;
  readonly memberId?: string;
}
