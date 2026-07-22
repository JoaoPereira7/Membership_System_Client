import { FormationAreaListItem } from '../../Models/formation-area.models';

export type FormationAreaDialogMode = 'create' | 'edit';

export interface FormationAreaDialogData {
  readonly mode: FormationAreaDialogMode;
  readonly item?: FormationAreaListItem;
}

export interface FormationAreaDialogResult {
  readonly saved: boolean;
  readonly item?: FormationAreaListItem;
}
