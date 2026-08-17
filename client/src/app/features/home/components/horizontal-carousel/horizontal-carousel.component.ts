import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-horizontal-carousel',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './horizontal-carousel.component.html',
  styleUrl: './horizontal-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalCarouselComponent {
  readonly itemCount = input.required<number>();
  readonly ariaLabel = input('Carrossel de conteúdo');

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  protected readonly activeIndex = signal(0);
  protected readonly indicators = computed(() =>
    Array.from({ length: this.itemCount() }, (_, index) => index),
  );
  protected readonly canGoBack = computed(() => this.activeIndex() > 0);
  protected readonly canGoForward = computed(
    () => this.activeIndex() < Math.max(0, this.itemCount() - 1),
  );

  protected previous(): void {
    this.goTo(this.activeIndex() - 1);
  }

  protected next(): void {
    this.goTo(this.activeIndex() + 1);
  }

  protected goTo(index: number): void {
    const viewport = this.viewport().nativeElement;
    const lastIndex = Math.max(0, this.itemCount() - 1);
    const nextIndex = Math.min(Math.max(index, 0), lastIndex);
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const left = lastIndex === 0 ? 0 : (maxScroll * nextIndex) / lastIndex;

    viewport.scrollTo({ left, behavior: 'smooth' });
    this.activeIndex.set(nextIndex);
  }

  protected syncPosition(event: Event): void {
    const viewport = event.currentTarget as HTMLElement;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const lastIndex = Math.max(0, this.itemCount() - 1);

    if (maxScroll <= 0 || lastIndex === 0) {
      this.activeIndex.set(0);
      return;
    }

    this.activeIndex.set(Math.round((viewport.scrollLeft / maxScroll) * lastIndex));
  }

  protected handleKeyboard(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.goTo(this.itemCount() - 1);
    }
  }
}
