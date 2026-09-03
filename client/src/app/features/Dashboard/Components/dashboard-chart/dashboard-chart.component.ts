import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BarChart, PieChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { EChartsCoreOption } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

echarts.use([
  BarChart,
  PieChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-dashboard-chart',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartComponent {
  readonly options = input.required<EChartsCoreOption>();
  readonly height = input<number>(340);
  readonly ariaLabel = input<string>('Gráfico do Dashboard');
}
