import { DepartmentListItem } from '../../Models/department.models';

export type DepartmentDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: DepartmentListItem };

export interface DepartmentDialogResult {
  readonly saved: boolean;
  readonly item?: DepartmentListItem;
}
