// externals modules
import { Component, signal, inject, computed, effect } from '@angular/core';
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
import { Navigation } from './core/services/navigation';
import { TilingService } from './core/services/tiling.service';
import { KeyboardService } from './core/services/keyboard.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, WindowComponent, Terminal, Skills, About, Projects, Contact],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');

  protected readonly navigationService = inject(Navigation);
  private readonly tilingService = inject(TilingService);
  private readonly keyboardService = inject(KeyboardService);

  protected readonly tabs = this.navigationService.tabs;
  protected readonly windowPositions = signal<Map<string, any>>(new Map());
  protected readonly showOverlay = computed(() => {
    const tabs = this.tabs();
    const maximizedTabs = tabs.filter(tab => tab.maximized && tab.open && !tab.minimized);
    const hasMaximized = maximizedTabs.length > 0;
    console.log('🔍 Debug - showOverlay:', hasMaximized, 'Maximized tabs:', maximizedTabs.map(t => t.id));
    return hasMaximized;
  });

  protected readonly activeTab = computed(() => {
    return this.tabs().find(tab => tab.active && !tab.minimized);
  });

  protected readonly hasMaximizedWindow = computed(() => {
    return this.tabs().some(tab => tab.maximized);
  });

  constructor() {
    // Registrar todas las ventanas disponibles
    this.registerAllWindows();

    // Setup automatic window positioning when tabs change
    effect(() => {
      const tabs = this.tabs();
      const activeTab = this.activeTab();

      // Always recalculate positions for any tab changes (including maximize/minimize)
      // Only respect lock if positions are explicitly locked
      if (!this.tilingService.isLocked()) {
        // Calculate new positions
        const positions = this.tilingService.calculateWindowPositions(
          tabs,
          activeTab?.id || ''
        );

        // Update positions signal
        this.windowPositions.set(positions);
      }
    });

    // Setup keyboard shortcuts
    this.setupKeyboardNotifications();
  }

  private registerAllWindows(): void {
    this.navigationService.registerTab({
      id: 'about',
      title: 'About Me',
    });

    // Aquí se registrarán las demás ventanas cuando se migren
    // this.navigationService.registerTab({
    //   id: 'terminal',
    //   title: 'Terminal',
    // });
    // this.navigationService.registerTab({
    //   id: 'file-manager',
    //   title: 'File Manager',
    // });
    // this.navigationService.registerTab({
    //   id: 'projects',
    //   title: 'Projects',
    // });
    // this.navigationService.registerTab({
    //   id: 'contact',
    //   title: 'Contact',
    // });
  }

  protected isTabVisible(tabId: string): boolean {
    const tab = this.tabs().find(t => t.id === tabId);
    return (tab?.open && !tab?.minimized) ?? false;
  }

  protected isTabMaximized(tabId: string): boolean {
    const tab = this.tabs().find(t => t.id === tabId);
    return tab?.maximized ?? false;
  }

  protected getZIndex(tabId: string): number {
    const tab = this.tabs().find(t => t.id === tabId);

    // Las ventanas maximizadas siempre tienen el z-index más alto
    if (tab?.maximized) {
      return 9999;
    }

    return tab?.zIndex ?? 100;
  }

  protected getWindowPosition(tabId: string): { top: string; left: string; width: string; height: string } {
    const positions = this.windowPositions();
    const position = positions.get(tabId);
    const tab = this.tabs().find(t => t.id === tabId);

    // For maximized windows, return empty to let CSS handle positioning
    if (tab?.maximized) {
      return { top: '', left: '', width: '', height: '' };
    }

    // For unmaximized windows, use tiling positions if available
    if (position) {
      return {
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`
      };
    }

    // Smart fallback: calculate reasonable initial size based on screen and open windows
    const openWindows = this.tabs().filter(t => t.open && !t.maximized);
    const screenAvailable = {
      width: window.innerWidth - 80,
      height: window.innerHeight - 120
    };

    // If this is the first window, give it a reasonable size
    if (openWindows.length <= 1) {
      return {
        top: '70px',
        left: '40px',
        width: `${Math.min(750, screenAvailable.width)}px`,
        height: `${Math.min(500, screenAvailable.height)}px`
      };
    }

    // Otherwise use a smaller default size for multiple windows
    return {
      top: '80px',
      left: '60px',
      width: `${Math.min(650, screenAvailable.width - 100)}px`,
      height: `${Math.min(400, screenAvailable.height - 100)}px`
    };
  }

  protected setActiveTab(tabId: string): void {
    this.navigationService.setActiveTab(tabId);
  }

  protected shouldShowActiveBorder(tabId: string): boolean {
    const tab = this.tabs().find(t => t.id === tabId);
    const hasMaximized = this.hasMaximizedWindow();

    // Mostrar borde solo si la ventana está activa Y no hay ventanas maximizadas
    return Boolean(tab?.active && !tab.minimized && tab.open && !hasMaximized);
  }

  private setupKeyboardNotifications(): void {
    // Listen for layout changes from keyboard shortcuts
    this.keyboardService.onLayoutChanged().subscribe(newLayout => {
      console.log(`🎯 Layout changed to: ${newLayout}`);
      // Could show a toast notification here if desired
    });
  }
}
