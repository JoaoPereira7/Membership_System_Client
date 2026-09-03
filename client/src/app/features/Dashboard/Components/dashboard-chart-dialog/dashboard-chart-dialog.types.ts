import { EChartsCoreOption } from 'echarts/core';

export interface DashboardChartDialogData {
  readonly title: string;
  readonly subtitle?: string;
  readonly chartOptions: EChartsCoreOption;
  readonly ariaLabel?: string;
  readonly chartHeight?: number;
}
