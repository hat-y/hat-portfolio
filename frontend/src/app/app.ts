// externals modules
import { Component, signal, inject, computed, effect } from '@angular/core';
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
  private readonly titleService = inject(Title);

  protected readonly tabs = this.navigationService.tabs;
  protected readonly windowPositions = signal<Map<string, any>>(new Map());
  protected readonly hasMaximizedWindow = computed(() => this.tabs().some(tab => tab.maximized && tab.open && !tab.minimized));
  protected readonly showOverlay = this.hasMaximizedWindow;

  protected readonly activeTab = computed(() => {
    return this.tabs().find(tab => tab.active && !tab.minimized);
  });

  constructor() {
    // Registrar todas las ventanas disponibles
    this.registerAllWindows();

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

  protected getWindowPosition(tabId: string): { top: string; left: string; width: string; height: string } {
    const positions = this.windowPositions();
    const position = positions.get(tabId);
    const tab = this.tabs().find(t => t.id === tabId);

    if (tab?.maximized) {
      return { top: '', left: '', width: '', height: '' };
    }

    if (position) {
      return {
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`
      };
    }

    return {
      top: '80px',
      left: '60px',
      width: `650px`,
      height: `400px`
    };
  }

  protected setActiveTab(tabId: string): void {
    this.navigationService.setActiveTab(tabId);
  }

  private setupKeyboardNotifications(): void {
    // Listen for layout changes from keyboard shortcuts
    this.keyboardService.onLayoutChanged().subscribe(newLayout => {
      console.log(`🎯 Layout changed to: ${newLayout}`);
      // Could show a toast notification here if desired
    });
  }
}
