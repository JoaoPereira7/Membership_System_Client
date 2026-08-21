import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AdvancedFilterGroup,
  AdvancedFilterResult,
  AdvancedFilterScalarValue,
  AdvancedFilterValue,
} from './advanced-filter.types';

interface AdvancedFilterGroupState<TItem> {
  readonly search: string;
  readonly options: readonly TItem[];
  readonly loading: boolean;
  readonly selected: readonly TItem[];
  readonly scalarValue: AdvancedFilterScalarValue;
}

const DEFAULT_REMOTE_SEARCH_DEBOUNCE = 400;

@Component({
  selector: 'app-advanced-filter',
  imports: [
    FormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './advanced-filter.component.html',
  styleUrl: './advanced-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdvancedFilterComponent<TItem = unknown> implements OnDestroy {
  readonly groups = input<readonly AdvancedFilterGroup<TItem>[]>([]);
  readonly selected = input<AdvancedFilterResult<TItem>>({});
  readonly remoteSearchDebounce = input<number>(DEFAULT_REMOTE_SEARCH_DEBOUNCE);
  readonly emptyMessage = input<string>('Nenhum resultado encontrado');
  readonly selectionPrompt = input<string>('Selecione um filtro ao lado para pesquisar');

  readonly selectedChange = output<AdvancedFilterResult<TItem>>();

  protected readonly activeGroupId = signal<string | null>(null);
  protected readonly activeGroup = computed<AdvancedFilterGroup<TItem> | null>(() => {
    const activeId = this.activeGroupId();
    return this.groups().find((group) => group.id === activeId) ?? null;
  });

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly itemList = viewChild<ElementRef<HTMLDivElement>>('itemList');
  private readonly states = signal<Record<string, AdvancedFilterGroupState<TItem>>>({});
  private readonly remoteSearchTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly remoteLoadVersions = new Map<string, number>();
  private previousGroups: readonly AdvancedFilterGroup<TItem>[] | null = null;

  constructor() {
    effect(() => {
      const groups = this.groups();
      const selected = this.selected();

      untracked(() => this.synchronizeGroups(groups, selected));
    });
  }

  @HostListener('document:click', ['$event.target'])
  protected closeWhenClickingOutside(target: EventTarget | null): void {
    if (target instanceof Node && this.hostElement.nativeElement.contains(target)) {
      return;
    }

    this.activeGroupId.set(null);
  }

  ngOnDestroy(): void {
    for (const timer of this.remoteSearchTimers.values()) {
      clearTimeout(timer);
    }
  }

  get hasAnySelected(): boolean {
    return this.groups().some((group) => this.selectedCount(group.id) > 0);
  }

  clearAll(): void {
    const nextStates = { ...this.states() };

    for (const group of this.groups()) {
      const state = nextStates[group.id];
      if (!state) {
        continue;
      }

      nextStates[group.id] = {
        ...state,
        selected: [],
        scalarValue: null,
      };
    }

    this.states.set(nextStates);
    this.activeGroupId.set(null);
    this.emitChange();
  }

  getCurrentResult(): AdvancedFilterResult<TItem> {
    const result: Record<string, AdvancedFilterValue<TItem>> = {};

    for (const group of this.groups()) {
      const state = this.states()[group.id];
      result[group.id] =
        group.searchType === 'scalar' ? (state?.scalarValue ?? null) : [...(state?.selected ?? [])];
    }

    return result;
  }

  protected selectGroup(groupId: string): void {
    this.activeGroupId.update((current) => (current === groupId ? null : groupId));

    setTimeout(() => {
      const itemList = this.itemList();
      if (itemList) {
        itemList.nativeElement.scrollTop = 0;
      }
    });
  }

  protected stateFor(groupId: string): AdvancedFilterGroupState<TItem> | undefined {
    return this.states()[groupId];
  }

  protected onSearchChange(group: AdvancedFilterGroup<TItem>, term: string): void {
    const normalizedTerm = term ?? '';
    this.updateState(group.id, { search: normalizedTerm });

    if (group.searchType === 'local') {
      this.updateState(group.id, {
        options: this.filterLocalItems(group, normalizedTerm),
      });
      return;
    }

    if (group.searchType !== 'remote') {
      return;
    }

    const currentTimer = this.remoteSearchTimers.get(group.id);
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    const delay = Math.max(0, this.remoteSearchDebounce());
    const timer = setTimeout(() => {
      this.remoteSearchTimers.delete(group.id);
      void this.loadRemoteItems(group, normalizedTerm);
    }, delay);
    this.remoteSearchTimers.set(group.id, timer);
  }

  protected onScalarChange(groupId: string, value: AdvancedFilterScalarValue): void {
    this.updateState(groupId, { scalarValue: value ?? null });
    this.emitChange();
  }

  protected scalarInputType(group: AdvancedFilterGroup<TItem>): string {
    return group.scalarType ?? 'text';
  }

  protected isSelected(group: AdvancedFilterGroup<TItem>, item: TItem): boolean {
    const itemId = group.getItemId(item);
    return (this.states()[group.id]?.selected ?? []).some(
      (selectedItem) => group.getItemId(selectedItem) === itemId,
    );
  }

  protected toggle(group: AdvancedFilterGroup<TItem>, item: TItem): void {
    const state = this.states()[group.id];
    if (!state) {
      return;
    }

    const itemId = group.getItemId(item);
    const selected = this.isSelected(group, item)
      ? state.selected.filter((selectedItem) => group.getItemId(selectedItem) !== itemId)
      : [...state.selected, item];

    this.updateState(group.id, { selected });
    this.emitChange();
  }

  protected removeItem(group: AdvancedFilterGroup<TItem>, item: TItem): void {
    const itemId = group.getItemId(item);
    const selected = (this.states()[group.id]?.selected ?? []).filter(
      (selectedItem) => group.getItemId(selectedItem) !== itemId,
    );

    this.updateState(group.id, { selected });
    this.emitChange();
  }

  protected selectedCount(groupId: string): number {
    const group = this.groups().find((candidate) => candidate.id === groupId);
    const state = this.states()[groupId];
    if (!group || !state) {
      return 0;
    }

    if (group.searchType === 'scalar') {
      return state.scalarValue === null || state.scalarValue === '' ? 0 : 1;
    }

    return state.selected.length;
  }

  protected chipLabel(group: AdvancedFilterGroup<TItem>, item: TItem): string {
    return group.getItemChipLabel?.(item) ?? group.getItemLabel(item);
  }

  private synchronizeGroups(
    groups: readonly AdvancedFilterGroup<TItem>[],
    selected: AdvancedFilterResult<TItem>,
  ): void {
    const previousStates = this.states();
    const groupsChanged = groups !== this.previousGroups;
    const nextStates: Record<string, AdvancedFilterGroupState<TItem>> = {};
    const remoteGroupsToLoad: AdvancedFilterGroup<TItem>[] = [];

    for (const group of groups) {
      const previous = previousStates[group.id];
      const hasExternalValue = Object.prototype.hasOwnProperty.call(selected, group.id);
      const externalValue = selected[group.id];

      if (group.searchType === 'scalar') {
        nextStates[group.id] = {
          search: '',
          options: [],
          loading: false,
          selected: [],
          scalarValue: hasExternalValue
            ? this.asScalarValue(externalValue)
            : (previous?.scalarValue ?? null),
        };
        continue;
      }

      const search = previous?.search ?? '';
      nextStates[group.id] = {
        search,
        options:
          group.searchType === 'local'
            ? this.filterLocalItems(group, search)
            : (previous?.options ?? []),
        loading: previous?.loading ?? false,
        selected:
          hasExternalValue && Array.isArray(externalValue)
            ? [...externalValue]
            : (previous?.selected ?? []),
        scalarValue: null,
      };

      if (group.searchType === 'remote' && group.loadItems && (!previous || groupsChanged)) {
        remoteGroupsToLoad.push(group);
      }
    }

    this.states.set(nextStates);
    this.previousGroups = groups;

    if (!groups.some((group) => group.id === this.activeGroupId())) {
      this.activeGroupId.set(null);
    }

    for (const group of remoteGroupsToLoad) {
      void this.loadRemoteItems(group, nextStates[group.id]?.search ?? '');
    }
  }

  private filterLocalItems(group: AdvancedFilterGroup<TItem>, search: string): readonly TItem[] {
    const normalizedSearch = this.normalize(search);
    if (!normalizedSearch) {
      return [...(group.localItems ?? [])];
    }

    return (group.localItems ?? []).filter((item) =>
      this.normalize(group.getItemLabel(item)).includes(normalizedSearch),
    );
  }

  private async loadRemoteItems(group: AdvancedFilterGroup<TItem>, search: string): Promise<void> {
    if (!group.loadItems) {
      return;
    }

    const version = (this.remoteLoadVersions.get(group.id) ?? 0) + 1;
    this.remoteLoadVersions.set(group.id, version);
    this.updateState(group.id, { loading: true });

    try {
      const options = await group.loadItems(search);
      if (this.remoteLoadVersions.get(group.id) === version) {
        this.updateState(group.id, { options: [...options] });
      }
    } catch {
      if (this.remoteLoadVersions.get(group.id) === version) {
        this.updateState(group.id, { options: [] });
      }
    } finally {
      if (this.remoteLoadVersions.get(group.id) === version) {
        this.updateState(group.id, { loading: false });
      }
    }
  }

  private updateState(groupId: string, changes: Partial<AdvancedFilterGroupState<TItem>>): void {
    this.states.update((states) => {
      const current = states[groupId];
      if (!current) {
        return states;
      }

      return {
        ...states,
        [groupId]: { ...current, ...changes },
      };
    });
  }

  private asScalarValue(value: AdvancedFilterValue<TItem> | undefined): AdvancedFilterScalarValue {
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private emitChange(): void {
    this.selectedChange.emit(this.getCurrentResult());
  }
}
