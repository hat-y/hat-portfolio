import { Component, signal, computed, OnDestroy, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../services/navigation';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private readonly navigationService = inject(Navigation);
  protected readonly themeService = inject(ThemeService);

  protected readonly currentTime: WritableSignal<string> = signal(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  );

  // Los tabs ahora vienen del servicio
  protected readonly tabs = this.navigationService.tabs;

  // Solo mostrar tabs abiertos en el header
  protected readonly openTabs = computed(() => {
    return this.tabs().filter((tab) => tab.open);
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
    this.showStartMenu.update((val) => !val);
  }

  selectTab(tabId: string): void {
    const tab = this.tabs().find((t) => t.id === tabId);
    if (tab?.open && !tab.minimized && tab.active) {
      // Si está abierto, visible y activo, minimizar
      this.navigationService.toggleMinimize(tabId);
    } else {
      // En cualquier otro caso (cerrado, minimizado, o no activo), activar/restaurar
      this.navigationService.setActiveTab(tabId);
    }
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
