import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { MinisterialTeamListItem } from '../../Models/ministerial-team.models';

@Component({
  selector: 'app-ministerial-team-details-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './ministerial-team-details-dialog.component.html',
  styleUrl: './ministerial-team-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinisterialTeamDetailsDialogComponent {
  protected readonly member = inject<MinisterialTeamListItem>(MAT_DIALOG_DATA);

  protected display(value: string | null | undefined): string {
    return value?.trim() || '-';
  }

  protected roles(): string {
    const names = this.member.roles.map((role) => role.churchRoleName.trim()).filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  }
}
