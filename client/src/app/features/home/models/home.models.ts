export type InstitutionalTone = 'red' | 'yellow' | 'blue' | 'purple' | 'teal';

export interface InstitutionalMoment {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly tone: InstitutionalTone;
}

export interface QuadrangularPillar {
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly tone: Exclude<InstitutionalTone, 'teal'>;
}

export interface FamilyValue {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export interface SystemShortcut {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly permission: string;
  readonly tone: InstitutionalTone;
}
