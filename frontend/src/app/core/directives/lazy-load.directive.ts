import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '50px';

  private observer: IntersectionObserver | null = null;
  private hasLoaded: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadContent();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.hasLoaded) {
          this.loadContent();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadContent(): void {
    if (this.hasLoaded) return;

    this.hasLoaded = true;

    // Add a CSS class to trigger animations or content loading
    this.el.nativeElement.classList.add('lazy-loaded');

    // Emit custom event for parent components to listen to
    this.el.nativeElement.dispatchEvent(
      new CustomEvent('lazyLoadComplete', {
        bubbles: true,
        detail: { element: this.el.nativeElement },
      }),
    );
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
