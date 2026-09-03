import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  ViewContainerRef,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EChartsCoreOption } from 'echarts/core';
import { EMPTY, Observable, catchError, finalize } from 'rxjs';

import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppPageHeaderComponent } from '../../../../core/components/page-header/page-header.component';
import { DashboardCardComponent } from '../../Components/dashboard-card/dashboard-card.component';
import { DashboardChartDialogComponent } from '../../Components/dashboard-chart-dialog/dashboard-chart-dialog.component';
import { DashboardChartDialogData } from '../../Components/dashboard-chart-dialog/dashboard-chart-dialog.types';
import {
  createDashboardBarOption,
  createDashboardDonutOption,
  createDashboardValueOption,
} from '../../Components/dashboard-chart/dashboard-chart-options';
import { DashboardChartComponent } from '../../Components/dashboard-chart/dashboard-chart.component';
import {
  DashboardBlockKey,
  DashboardCardTone,
  DashboardCardViewModel,
  DashboardChartBlockKey,
  DashboardChurchTotal,
  DashboardLoadState,
  DashboardNamedTotal,
  DashboardTotal,
  DashboardTotalBlockKey,
  DashboardViewMode,
} from '../../Models/dashboard.models';
import { DashboardService } from '../../Services/dashboard.service';

const VIEW_MODE_STORAGE_KEY = 'membership_ieq_dashboard_view_mode';

interface BaseCardDefinition {
  readonly title: string;
  readonly icon: string;
  readonly tone: DashboardCardTone;
  readonly subtitle: string;
}

interface TotalCardDefinition extends BaseCardDefinition {
  readonly kind: 'total';
  readonly key: DashboardTotalBlockKey;
}

interface ListCardDefinition extends BaseCardDefinition {
  readonly kind: 'list';
  readonly key: DashboardChartBlockKey;
}

type CardDefinition = TotalCardDefinition | ListCardDefinition;

interface ChartDefinition {
  readonly key: DashboardChartBlockKey;
  readonly title: string;
  readonly subtitle: string;
}

function initialState<T>(): DashboardLoadState<T> {
  return { data: null, loading: true, error: null };
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonToggleModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AppPageHeaderComponent,
    DashboardCardComponent,
    DashboardChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly service = inject(DashboardService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly numberFormatter = new Intl.NumberFormat('pt-BR');

  protected readonly viewMode = signal<DashboardViewMode>(this.readViewMode());
  protected readonly totalMembers = signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly activeMembers = signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly inactiveMembers = signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly membersByStatus =
    signal<DashboardLoadState<readonly DashboardNamedTotal[]>>(initialState());
  protected readonly membersByDepartment =
    signal<DashboardLoadState<readonly DashboardNamedTotal[]>>(initialState());
  protected readonly membersWithoutDepartment =
    signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly membersByRole =
    signal<DashboardLoadState<readonly DashboardNamedTotal[]>>(initialState());
  protected readonly membersWithoutRole =
    signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly leaders = signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly leadersByDepartment =
    signal<DashboardLoadState<readonly DashboardNamedTotal[]>>(initialState());
  protected readonly departmentsCount = signal<DashboardLoadState<DashboardTotal>>(initialState());
  protected readonly membersByChurch =
    signal<DashboardLoadState<readonly DashboardChurchTotal[]>>(initialState());

  private readonly cardDefinitions: readonly CardDefinition[] = [
    {
      kind: 'total',
      key: 'totalMembers',
      title: 'Quantidade total de membros',
      icon: 'groups',
      tone: 'primary',
      subtitle: 'Membros válidos no escopo atual',
    },
    {
      kind: 'total',
      key: 'activeMembers',
      title: 'Membros ativos',
      icon: 'how_to_reg',
      tone: 'success',
      subtitle: 'Cadastros ativos atualmente',
    },
    {
      kind: 'total',
      key: 'inactiveMembers',
      title: 'Membros inativos',
      icon: 'person_off',
      tone: 'danger',
      subtitle: 'Cadastros que exigem acompanhamento',
    },
    {
      kind: 'total',
      key: 'leaders',
      title: 'Membros líderes',
      icon: 'workspace_premium',
      tone: 'secondary',
      subtitle: 'Pessoas com liderança ativa',
    },
    {
      kind: 'total',
      key: 'membersWithoutDepartment',
      title: 'Membros sem departamento',
      icon: 'group_off',
      tone: 'neutral',
      subtitle: 'Sem participação departamental ativa',
    },
    {
      kind: 'total',
      key: 'membersWithoutRole',
      title: 'Membros sem cargo',
      icon: 'badge',
      tone: 'neutral',
      subtitle: 'Sem cargo eclesiástico ativo',
    },
    {
      kind: 'total',
      key: 'departmentsCount',
      title: 'Quantidade de departamentos',
      icon: 'account_tree',
      tone: 'primary',
      subtitle: 'Departamentos ativos vinculados',
    },
    {
      kind: 'list',
      key: 'membersByStatus',
      title: 'Membros por status de membresia',
      icon: 'donut_small',
      tone: 'primary',
      subtitle: 'Distribuição por situação atual',
    },
    {
      kind: 'list',
      key: 'membersByDepartment',
      title: 'Membros por departamento',
      icon: 'diversity_3',
      tone: 'primary',
      subtitle: 'Participantes ativos por departamento',
    },
    {
      kind: 'list',
      key: 'membersByRole',
      title: 'Membros por cargo',
      icon: 'military_tech',
      tone: 'secondary',
      subtitle: 'Cargos eclesiásticos exercidos',
    },
    {
      kind: 'list',
      key: 'leadersByDepartment',
      title: 'Líderes por departamento',
      icon: 'supervisor_account',
      tone: 'success',
      subtitle: 'Lideranças ativas por área',
    },
    {
      kind: 'list',
      key: 'membersByChurch',
      title: 'Quantidade de membros por igreja',
      icon: 'church',
      tone: 'primary',
      subtitle: 'Igrejas disponíveis no seu escopo',
    },
  ];

  protected readonly cards = computed<readonly DashboardCardViewModel[]>(() =>
    this.cardDefinitions.map((definition) =>
      definition.kind === 'total'
        ? this.createTotalCard(definition)
        : this.createListCard(definition),
    ),
  );

  protected readonly primaryMetricCards = computed(() => this.cards().slice(0, 4));
  protected readonly complementaryMetricCards = computed(() => this.cards().slice(4, 7));

  protected readonly distributionCharts: readonly ChartDefinition[] = [
    {
      key: 'membersByStatus',
      title: 'Membros por status de membresia',
      subtitle: 'Distribuição dos vínculos por situação atual',
    },
    {
      key: 'membersByDepartment',
      title: 'Membros por departamento',
      subtitle: 'Participantes ativos em cada departamento',
    },
  ];

  protected readonly leadershipCharts: readonly ChartDefinition[] = [
    {
      key: 'membersByRole',
      title: 'Membros por cargo',
      subtitle: 'Cargos eclesiásticos atualmente exercidos',
    },
    {
      key: 'leadersByDepartment',
      title: 'Líderes por departamento',
      subtitle: 'Lideranças ativas na estrutura ministerial',
    },
  ];

  protected readonly currentChurchName = computed(() => {
    const churchId = this.auth.user()?.churchId;
    if (!churchId) return 'Todas as igrejas';

    return (
      this.membersByChurch().data?.find((church) => church.churchId === churchId)?.name ??
      'Igreja vinculada'
    );
  });

  private readonly statusOption = computed<EChartsCoreOption>(() =>
    createDashboardDonutOption(this.membersByStatus().data ?? []),
  );
  private readonly departmentOption = computed<EChartsCoreOption>(() =>
    createDashboardBarOption(this.membersByDepartment().data ?? [], '#1976d2'),
  );
  private readonly roleOption = computed<EChartsCoreOption>(() =>
    createDashboardBarOption(this.membersByRole().data ?? [], '#6a1b9a'),
  );
  private readonly leaderOption = computed<EChartsCoreOption>(() =>
    createDashboardBarOption(this.leadersByDepartment().data ?? [], '#2e7d32'),
  );
  private readonly churchOption = computed<EChartsCoreOption>(() =>
    createDashboardBarOption(this.membersByChurch().data ?? [], '#1565c0'),
  );

  constructor() {
    this.reloadAll();
  }

  protected setViewMode(value: unknown): void {
    if (value !== 'cards' && value !== 'charts') return;

    this.viewMode.set(value);
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, value);
    } catch {
      // A preferência é opcional quando o armazenamento do navegador está indisponível.
    }
  }

  protected openDetails(card: DashboardCardViewModel): void {
    const chartOptions = this.detailChartOption(card);
    if (!chartOptions) return;

    const data: DashboardChartDialogData = {
      title: card.title,
      subtitle: this.currentChurchName(),
      chartOptions,
      ariaLabel: `Gráfico de ${card.title}`,
      chartHeight: this.detailChartHeight(card.key),
    };

    this.dialog.open<DashboardChartDialogComponent, DashboardChartDialogData>(
      DashboardChartDialogComponent,
      {
        data,
        width: '880px',
        maxWidth: 'calc(100vw - 1.5rem)',
        maxHeight: 'calc(100dvh - 1.5rem)',
        autoFocus: false,
        restoreFocus: true,
        panelClass: 'dashboard-chart-dialog-panel',
        viewContainerRef: this.viewContainerRef,
      },
    );
  }

  protected reloadAll(): void {
    const blocks: readonly DashboardBlockKey[] = [
      'totalMembers',
      'activeMembers',
      'inactiveMembers',
      'membersByStatus',
      'membersByDepartment',
      'membersWithoutDepartment',
      'membersByRole',
      'membersWithoutRole',
      'leaders',
      'leadersByDepartment',
      'departmentsCount',
      'membersByChurch',
    ];

    blocks.forEach((block) => this.reload(block));
  }

  protected reload(block: DashboardBlockKey): void {
    switch (block) {
      case 'totalMembers':
        this.load(this.totalMembers, this.service.getTotalMembers());
        break;
      case 'activeMembers':
        this.load(this.activeMembers, this.service.getActiveMembers());
        break;
      case 'inactiveMembers':
        this.load(this.inactiveMembers, this.service.getInactiveMembers());
        break;
      case 'membersByStatus':
        this.load(this.membersByStatus, this.service.getMembersByStatus());
        break;
      case 'membersByDepartment':
        this.load(this.membersByDepartment, this.service.getMembersByDepartment());
        break;
      case 'membersWithoutDepartment':
        this.load(this.membersWithoutDepartment, this.service.getMembersWithoutDepartment());
        break;
      case 'membersByRole':
        this.load(this.membersByRole, this.service.getMembersByRole());
        break;
      case 'membersWithoutRole':
        this.load(this.membersWithoutRole, this.service.getMembersWithoutRole());
        break;
      case 'leaders':
        this.load(this.leaders, this.service.getLeaders());
        break;
      case 'leadersByDepartment':
        this.load(this.leadersByDepartment, this.service.getLeadersByDepartment());
        break;
      case 'departmentsCount':
        this.load(this.departmentsCount, this.service.getDepartmentsCount());
        break;
      case 'membersByChurch':
        this.load(this.membersByChurch, this.service.getMembersByChurch());
        break;
    }
  }

  protected chartState(
    key: DashboardChartBlockKey,
  ): DashboardLoadState<readonly DashboardNamedTotal[]> {
    return this.chartSignals[key]();
  }

  protected chartOption(key: DashboardChartBlockKey): EChartsCoreOption {
    return this.chartOptions[key]();
  }

  protected chartHeight(items: readonly DashboardNamedTotal[]): number {
    return Math.max(300, Math.min(520, 140 + items.length * 34));
  }

  private createTotalCard(definition: TotalCardDefinition): DashboardCardViewModel {
    const state = this.totalSignals[definition.key]();
    return {
      ...definition,
      value: state.data ? this.formatTotal(state.data.total) : null,
      items: [],
      subtitle: this.metricSubtitle(definition, state.data?.total),
      loading: state.loading,
      error: state.error,
    };
  }

  private createListCard(definition: ListCardDefinition): DashboardCardViewModel {
    const state = this.chartSignals[definition.key]();
    return {
      ...definition,
      value: null,
      items: (state.data ?? []).map((item) => ({
        label: item.name,
        value: this.formatTotal(item.total),
      })),
      loading: state.loading,
      error: state.error,
    };
  }

  private metricSubtitle(definition: TotalCardDefinition, value: number | undefined): string {
    if (definition.key === 'totalMembers' || definition.key === 'departmentsCount')
      return definition.subtitle;

    const total = this.totalMembers().data?.total ?? 0;
    if (value === undefined || total <= 0) return definition.subtitle;

    return `${Math.round((value / total) * 100)}% do total de membros`;
  }

  private detailChartOption(card: DashboardCardViewModel): EChartsCoreOption | null {
    if (this.isChartKey(card.key)) {
      const state = this.chartSignals[card.key]();
      return state.data?.length ? this.chartOptions[card.key]() : null;
    }

    const total = this.totalSignals[card.key]().data?.total;
    return total === undefined
      ? null
      : createDashboardValueOption(card.title, total, this.toneColor(card.tone));
  }

  private detailChartHeight(key: DashboardBlockKey): number {
    if (!this.isChartKey(key)) return 300;
    if (key === 'membersByStatus') return 380;
    return this.chartHeight(this.chartSignals[key]().data ?? []);
  }

  private isChartKey(key: DashboardBlockKey): key is DashboardChartBlockKey {
    return [
      'membersByStatus',
      'membersByDepartment',
      'membersByRole',
      'leadersByDepartment',
      'membersByChurch',
    ].includes(key);
  }

  private toneColor(tone: DashboardCardTone): string {
    return {
      primary: '#1976d2',
      success: '#2e7d32',
      danger: '#d32f2f',
      secondary: '#6a1b9a',
      neutral: '#64748b',
    }[tone];
  }

  private formatTotal(value: number): string {
    return this.numberFormatter.format(value);
  }

  private get totalSignals(): Record<
    DashboardTotalBlockKey,
    WritableSignal<DashboardLoadState<DashboardTotal>>
  > {
    return {
      totalMembers: this.totalMembers,
      activeMembers: this.activeMembers,
      inactiveMembers: this.inactiveMembers,
      membersWithoutDepartment: this.membersWithoutDepartment,
      membersWithoutRole: this.membersWithoutRole,
      leaders: this.leaders,
      departmentsCount: this.departmentsCount,
    };
  }

  private get chartSignals(): Record<
    DashboardChartBlockKey,
    WritableSignal<DashboardLoadState<readonly DashboardNamedTotal[]>>
  > {
    return {
      membersByStatus: this.membersByStatus,
      membersByDepartment: this.membersByDepartment,
      membersByRole: this.membersByRole,
      leadersByDepartment: this.leadersByDepartment,
      membersByChurch: this.membersByChurch,
    };
  }

  private get chartOptions(): Record<
    DashboardChartBlockKey,
    ReturnType<typeof computed<EChartsCoreOption>>
  > {
    return {
      membersByStatus: this.statusOption,
      membersByDepartment: this.departmentOption,
      membersByRole: this.roleOption,
      leadersByDepartment: this.leaderOption,
      membersByChurch: this.churchOption,
    };
  }

  private load<T>(target: WritableSignal<DashboardLoadState<T>>, request: Observable<T>): void {
    target.set({ data: null, loading: true, error: null });

    request
      .pipe(
        catchError((error: unknown) => {
          target.set({
            data: null,
            loading: false,
            error: getApiErrorMessage(error, 'Não foi possível carregar este indicador.'),
          });
          return EMPTY;
        }),
        finalize(() => target.update((state) => ({ ...state, loading: false }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => target.set({ data, loading: false, error: null }));
  }

  private readViewMode(): DashboardViewMode {
    if (!isPlatformBrowser(this.platformId)) return 'cards';

    try {
      return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'charts' ? 'charts' : 'cards';
    } catch {
      return 'cards';
    }
  }
}
