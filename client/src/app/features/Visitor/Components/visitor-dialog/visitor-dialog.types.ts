import { VisitorListItem } from '../../Models/visitor.models';

export type VisitorDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly item: VisitorListItem };

export interface VisitorDialogResult {
  readonly saved: boolean;
  readonly item?: VisitorListItem;
}
