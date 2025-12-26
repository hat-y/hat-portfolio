import {
  Component,
  signal,
  computed,
  OnDestroy,
  WritableSignal,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navigation, Tab } from '../../services/navigation';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { TilingService, LayoutMode } from '../../services/tiling.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private readonly navigationService = inject(Navigation);
  protected readonly themeService = inject(ThemeService);
  protected readonly tilingService = inject(TilingService);

  protected readonly currentTime: WritableSignal<string> = signal(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  );

  protected readonly tabs: Signal<Tab[]> = this.navigationService.tabs;

  protected readonly openTabs: Signal<Tab[]> = computed(() => {
    return this.tabs().filter((tab: Tab): boolean => tab.open);
  });

  protected showStartMenu: WritableSignal<boolean> = signal(false);

  private clockInterval: any;

  constructor() {
    this.clockInterval = setInterval(() => {
      this.currentTime.set(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      );
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  toggleStartMenu(): void {
    this.showStartMenu.update((val: boolean): boolean => !val);
  }

  selectTab(tabId: string): void {
    const tab = this.tabs().find((t: Tab): boolean => t.id === tabId);
    if (tab?.open && !tab.minimized && tab.active) {
      this.navigationService.toggleMinimize(tabId);
    } else {
      this.navigationService.setActiveTab(tabId);
    }
  }

  setLayout(mode: LayoutMode): void {
    this.tilingService.setLayoutMode(mode);
  }

  /**
   * Toggle theme mode: auto -> light -> dark -> auto
   */
  toggleTheme(): void {
    const currentMode = this.themeService.themeMode();
    let newMode: ThemeMode;

    switch (currentMode) {
      case 'auto':
        newMode = 'light';
        break;
      case 'light':
        newMode = 'dark';
        break;
      case 'dark':
        newMode = 'auto';
        break;
      default:
        newMode = 'auto';
    }

    this.themeService.setThemeMode(newMode);
  }

  /**
   * Get accessible label for theme toggle button
   */
  getThemeAriaLabel(): string {
    const mode = this.themeService.themeMode();
    const isDark = this.themeService.isDarkMode();

    switch (mode) {
      case 'auto':
        return `Theme: Auto (currently ${isDark ? 'dark' : 'light'} mode), click to set light theme`;
      case 'light':
        return 'Theme: Light mode, click to set dark theme';
      case 'dark':
        return 'Theme: Dark mode, click to set auto theme';
      default:
        return 'Toggle theme';
    }
  }
}
