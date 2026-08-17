import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EntityDetailsDialogComponent } from '../../../../core/components/entity-details-dialog/entity-details-dialog.component';

@Component({
  selector: 'app-religious-origin-details-dialog',
  imports: [EntityDetailsDialogComponent],
  template: '<app-entity-details-dialog />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReligiousOriginDetailsDialogComponent {}
