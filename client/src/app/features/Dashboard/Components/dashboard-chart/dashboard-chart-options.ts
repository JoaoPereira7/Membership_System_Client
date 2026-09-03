import { EChartsCoreOption } from 'echarts/core';

import { DashboardNamedTotal } from '../../Models/dashboard.models';

const CHART_COLORS = ['#1976d2', '#2e7d32', '#f9a825', '#6a1b9a', '#d32f2f', '#64748b'];

export function createDashboardDonutOption(
  items: readonly DashboardNamedTotal[],
): EChartsCoreOption {
  return {
    animationDuration: 450,
    aria: { enabled: true },
    color: CHART_COLORS,
    tooltip: { trigger: 'item' },
    legend: {
      type: 'scroll',
      bottom: 0,
      left: 'center',
      textStyle: { color: '#475569', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '43%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scaleSize: 4,
          label: { show: true, fontSize: 13, fontWeight: 600 },
        },
        data: items.map((item) => ({ name: item.name, value: item.total })),
      },
    ],
  };
}

export function createDashboardBarOption(
  items: readonly DashboardNamedTotal[],
  color: string,
): EChartsCoreOption {
  const ordered = [...items].sort(
    (left, right) => right.total - left.total || left.name.localeCompare(right.name),
  );

  return {
    animationDuration: 450,
    aria: { enabled: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 8, right: 34, bottom: 12, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ordered.map((item) => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#334155', fontSize: 12, width: 170, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: ordered.map((item) => item.total),
        barMaxWidth: 22,
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#475569', fontWeight: 600 },
      },
    ],
  };
}

export function createDashboardValueOption(
  title: string,
  total: number,
  color: string,
): EChartsCoreOption {
  return createDashboardBarOption([{ name: title, total }], color);
}
