export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly route?: string;
  readonly permission?: string;
  readonly children?: readonly NavigationItem[];
  readonly disabled?: boolean;
  readonly exact?: boolean;
  readonly section?: string;
}
