import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { DashboardChartComponent } from '../dashboard-chart/dashboard-chart.component';
import { DashboardChartDialogData } from './dashboard-chart-dialog.types';

@Component({
  selector: 'app-dashboard-chart-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, DashboardChartComponent],
  templateUrl: './dashboard-chart-dialog.component.html',
  styleUrl: './dashboard-chart-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartDialogComponent {
  protected readonly data = inject<DashboardChartDialogData>(MAT_DIALOG_DATA);
}
