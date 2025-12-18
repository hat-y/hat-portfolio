import { Component, Input, Output, EventEmitter, HostListener, inject, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../services/navigation';

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
    '[style.position]': 'maximized ? "fixed" : "absolute"',
    '[style.top]': 'maximized ? "50px" : windowTop',
    '[style.left]': 'maximized ? "20px" : windowLeft',
    '[style.width]': 'maximized ? "calc(100vw - 40px)" : windowWidth',
    '[style.height]': 'maximized ? "calc(100vh - 70px)" : windowHeight',
    '[style.z-index]': 'maximized ? 9999 : windowZIndex',
    '[attr.data-maximized]': 'maximized',
    '[class.is-maximized]': 'maximized',
    '[style.display]': 'visible ? "block" : "none"'
  }
})
export class WindowComponent {
  private readonly navigationService = inject(Navigation);

  // Inputs configurables
  @Input() windowId: string = '';
  @Input() title: string = 'Window';
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
  protected isActive = computed(() => {
    const tabs = this.navigationService.tabs();
    return tabs.find(tab => tab.id === this.windowId)?.active ?? false;
  });

  protected windowClass = computed(() =>
    `window-component ${this.isActive() ? 'active' : 'inactive'} ${this.maximized ? 'maximized' : ''}`
  );

  // Métodos de control de ventana
  protected onMinimize(): void {
    this.minimize.emit();
  }

  protected onMaximize(): void {
    this.maximize.emit();
  }

  protected onClose(): void {
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
}