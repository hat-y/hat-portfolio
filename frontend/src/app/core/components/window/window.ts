import { Component, Input, Output, EventEmitter, HostListener, inject, computed, Signal, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../services/navigation';
import { FocusTrapService } from '../../services/focus-trap.service';

export interface WindowPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-window',
  imports: [CommonModule],
  templateUrl: './window.html',
  styleUrl: './window.css',
  host: {
    'class': 'window-wrapper',
    '[style.top]': 'windowTop',
    '[style.left]': 'windowLeft',
    '[style.width]': 'windowWidth',
    '[style.height]': 'windowHeight',
    '[style.z-index]': 'windowZIndex',
    '[attr.data-maximized]': 'maximized',
    '[class.is-maximized]': 'maximized',
    '[style.display]': 'visible ? "block" : "none"'
  }
})
export class WindowComponent {
  private readonly navigationService = inject(Navigation);
  private readonly focusTrapService = inject(FocusTrapService);
  private readonly elementRef = inject(ElementRef);

  // Inputs configurables
  @Input() windowId: string = '';
  @Input() title: string = 'Window';
  @Input() icon: string = '';
  @Input() windowTop: string = '';
  @Input() windowLeft: string = '';
  @Input() windowWidth: string = '';
  @Input() windowHeight: string = '';
  @Input() windowZIndex: number = 100;
  @Input() maximized: boolean = false;
  @Input() visible: boolean = true;
  @Input() canMinimize: boolean = true;
  @Input() canMaximize: boolean = true;
  @Input() canClose: boolean = true;

  // Events
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  // Computed properties
  protected isWindowActive = computed(() => {
    const tabs = this.navigationService.tabs();
    return tabs.find(tab => tab.id === this.windowId)?.active ?? false;
  });

  protected windowClass = computed(() =>
    `window-component ${this.isWindowActive() ? 'active' : 'inactive'} ${this.maximized ? 'maximized' : ''}`
  );

  constructor() {
    effect(() => {
      if (this.isWindowActive()) {
        this.focusTrapService.trapFocus(this.elementRef.nativeElement);
      }
    });
  }

  // Métodos de control de ventana
  protected onMinimize(): void {
    this.minimize.emit();
  }

  protected onMaximize(): void {
    this.maximize.emit();
  }
  
  protected onClose(): void {
    this.focusTrapService.removeFocusTrap(this.elementRef.nativeElement);
    this.close.emit();
  }

  protected onFocus(): void {
    this.focus.emit();
    this.navigationService.setActiveTab(this.windowId);
  }

  // Keyboard shortcuts
  @HostListener('keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  @HostListener('keydown.f11', ['$event'])
  protected onF11(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.maximize.emit();
  }

  // Accessibility
  protected getAriaLabel(): string {
    return `${this.title} window. Press Escape to close, F11 to maximize.`;
  }

  // Método para template compatibility
  protected isActive(): boolean {
    return this.isWindowActive();
  }
}