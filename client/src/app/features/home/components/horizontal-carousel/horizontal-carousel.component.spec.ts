import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalCarouselComponent } from './horizontal-carousel.component';

describe('HorizontalCarouselComponent', () => {
  let fixture: ComponentFixture<HorizontalCarouselComponent>;
  let viewport: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HorizontalCarouselComponent);
    fixture.componentRef.setInput('itemCount', 3);
    fixture.componentRef.setInput('ariaLabel', 'Linha do tempo da igreja');
    fixture.detectChanges();

    viewport = fixture.nativeElement.querySelector('.horizontal-carousel__viewport');
    Object.defineProperty(viewport, 'scrollWidth', { configurable: true, value: 600 });
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 200 });
    viewport.scrollTo = (() => undefined) as typeof viewport.scrollTo;
  });

  it('should render one indicator per item with an accessible region label', () => {
    const indicators = fixture.nativeElement.querySelectorAll(
      '.horizontal-carousel__indicators button',
    );

    expect(indicators.length).toBe(3);
    expect(viewport.getAttribute('aria-label')).toBe('Linha do tempo da igreja');
  });

  it('should move to the next item with the ArrowRight key', () => {
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll(
      '.horizontal-carousel__indicators button',
    );

    expect(indicators[1].getAttribute('aria-current')).toBe('true');
  });
});
