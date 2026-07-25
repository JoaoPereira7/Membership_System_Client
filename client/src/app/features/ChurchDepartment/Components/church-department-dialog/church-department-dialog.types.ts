import { ChurchDepartmentListItem } from '../../Models/church-department.models';

export type ChurchDepartmentDialogData =
  { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: ChurchDepartmentListItem };

export interface ChurchDepartmentDialogResult {
  readonly saved: boolean;
  readonly item?: ChurchDepartmentListItem;
}
