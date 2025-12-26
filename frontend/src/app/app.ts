// externals modules
import { Component, signal, inject, computed, effect, WritableSignal, Signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// internals modules
import { Header } from './core/layout/header/header';
import { WindowComponent } from './core/components/window/window';
import { Terminal } from './modules/terminal/terminal';
import { Skills } from './modules/skills/skills';
import { About } from './modules/about/about';
import { Projects } from './modules/projects/projects';
import { Contact } from './modules/contact/contact';
import { Navigation, Tab } from './core/services/navigation';
import { TilingService } from './core/services/tiling.service';
import { KeyboardService } from './core/services/keyboard.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    WindowComponent,
    Terminal,
    Skills,
    About,
    Projects,
    Contact,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title: WritableSignal<string> = signal('frontend');

  protected readonly navigationService: Navigation = inject(Navigation);
  private readonly tilingService = inject(TilingService);
  private readonly keyboardService = inject(KeyboardService);
  private readonly titleService: Title = inject(Title);

  protected readonly tabs: Signal<Tab[]> = this.navigationService.tabs;
  protected readonly windowPositions = signal<Map<string, any>>(new Map());
  protected readonly hasMaximizedWindow = computed(() =>
    this.tabs().some((tab: Tab): boolean => tab.maximized && tab.open && !tab.minimized),
  );
  protected readonly showOverlay = this.hasMaximizedWindow;

  protected readonly activeTab = computed(() => {
    return this.tabs().find((tab) => tab.active && !tab.minimized);
  });

  // Header dimensions - must match CSS values
  // Taskbar: top=8px, height=28px, padding=4px, border=1px each side = 42px total
  private readonly HEADER_HEIGHT = 28;  // --header-height
  private readonly HEADER_OFFSET = 8;    // --header-offset-top (--space-2)
  private readonly TASKBAR_PADDING = 4;  // --space-1 (padding inside taskbar)
  private readonly TASKBAR_BORDER = 2;   // 1px top + 1px bottom border
  private readonly HEADER_TOTAL = 42;    // 8 + 28 + 4 + 2 = 42px (taskbar bottom)
  private readonly TASKBAR_GAP = 8;      // Additional gap below taskbar for visual separation
  private readonly WINDOW_MARGIN = 20;   // --space-5

  // Computed maximized dimensions
  protected readonly maximizedWindowProps = computed(() => {
    // Safe window access
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const topPosition = this.HEADER_TOTAL + this.TASKBAR_GAP;

    return {
      top: `${topPosition}px`,
      left: `${this.WINDOW_MARGIN}px`,
      width: `${viewportWidth - (this.WINDOW_MARGIN * 2)}px`,
      height: `${viewportHeight - topPosition - this.WINDOW_MARGIN}px`
    };
  });

  constructor() {
    // Registrar todas las ventanas disponibles
    this.registerAllWindows();
    this.navigationService.initializeFromUrl();

    // Effect for dynamic document title
    effect(() => {
      const activeTab = this.activeTab();
      if (activeTab) {
        this.titleService.setTitle(`${activeTab.title} | hat-portfolio`);
      } else {
        this.titleService.setTitle('hat-portfolio');
      }
    });

    // Setup automatic window positioning when tabs change
    effect(
      () => {
        setTimeout(() => {
          const tabs = this.tabs();
          const activeTab = this.activeTab();
          const layoutMode = this.tilingService.getCurrentLayout();

          if (layoutMode === 'floating') {
            const newPositions = this.tilingService.calculateFloatingPositions(
              tabs,
              this.windowPositions(),
            );
            this.windowPositions.set(newPositions);
          } else {
            // Para otros layouts, recalcular todo
            if (!this.tilingService.isLocked()) {
              const positions = this.tilingService.calculateWindowPositions(
                tabs,
                activeTab?.id || '',
              );
              this.windowPositions.set(positions);
            }
          }
        }, 0);
      },
      { allowSignalWrites: true },
    );

    // Setup keyboard shortcuts
    this.setupKeyboardNotifications();
  }

  private registerAllWindows(): void {
    this.navigationService.registerTab({
      id: 'about',
      title: 'About Me',
    });

    this.navigationService.registerTab({
      id: 'terminal',
      title: 'Terminal',
    });
    this.navigationService.registerTab({
      id: 'skills',
      title: 'Technical Skills',
    });
    this.navigationService.registerTab({
      id: 'projects',
      title: 'Projects',
    });
    this.navigationService.registerTab({
      id: 'contact',
      title: 'Contact',
    });
  }

  protected setActiveTab(tabId: string): void {
    this.navigationService.setActiveTab(tabId);
  }

  private setupKeyboardNotifications(): void {
    // Listen for layout changes from keyboard shortcuts
    this.keyboardService.onLayoutChanged().subscribe((newLayout) => {
      console.log(` Layout changed to: ${newLayout}`);
      // Could show a toast notification here if desired
    });
  }
}
