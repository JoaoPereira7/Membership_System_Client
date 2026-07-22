import { EducationLevelListItem } from '../../Models/education-level.models';

export type EducationLevelDialogMode = 'create' | 'edit';

export interface EducationLevelDialogData {
  readonly mode: EducationLevelDialogMode;
  readonly item?: EducationLevelListItem;
}

export interface EducationLevelDialogResult {
  readonly saved: boolean;
  readonly item?: EducationLevelListItem;
}
