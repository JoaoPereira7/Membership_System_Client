import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EntityDeleteDialogComponent } from '../../../../core/components/entity-delete-dialog/entity-delete-dialog.component';

@Component({
  selector: 'app-member-delete-dialog',
  imports: [EntityDeleteDialogComponent],
  template: '<app-entity-delete-dialog />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDeleteDialogComponent {}
