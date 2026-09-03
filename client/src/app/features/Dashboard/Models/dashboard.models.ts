export interface DashboardTotal {
  readonly total: number;
}

export interface DashboardNamedTotal extends DashboardTotal {
  readonly name: string;
}

export interface DashboardChurchTotal extends DashboardNamedTotal {
  readonly churchId: string;
}

export interface DashboardLoadState<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export type DashboardViewMode = 'cards' | 'charts';

export type DashboardCardTone = 'primary' | 'success' | 'danger' | 'secondary' | 'neutral';

export interface DashboardCardItem {
  readonly label: string;
  readonly value: string;
}

export interface DashboardCardViewModel {
  readonly key: DashboardBlockKey;
  readonly title: string;
  readonly icon: string;
  readonly tone: DashboardCardTone;
  readonly value: string | null;
  readonly items: readonly DashboardCardItem[];
  readonly subtitle: string | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export type DashboardBlockKey =
  | 'totalMembers'
  | 'activeMembers'
  | 'inactiveMembers'
  | 'membersByStatus'
  | 'membersByDepartment'
  | 'membersWithoutDepartment'
  | 'membersByRole'
  | 'membersWithoutRole'
  | 'leaders'
  | 'leadersByDepartment'
  | 'departmentsCount'
  | 'membersByChurch';

export type DashboardTotalBlockKey =
  | 'totalMembers'
  | 'activeMembers'
  | 'inactiveMembers'
  | 'membersWithoutDepartment'
  | 'membersWithoutRole'
  | 'leaders'
  | 'departmentsCount';

export type DashboardChartBlockKey =
  | 'membersByStatus'
  | 'membersByDepartment'
  | 'membersByRole'
  | 'leadersByDepartment'
  | 'membersByChurch';
