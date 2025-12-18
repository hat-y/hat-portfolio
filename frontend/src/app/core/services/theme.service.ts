import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _themeMode = signal<ThemeMode>('auto');
  private readonly _isDarkMode = signal(false);

  readonly themeMode = this._themeMode.asReadonly();
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    // Load saved theme preference
    this.loadThemePreference();

    // Apply theme when mode changes
    effect(() => {
      this.applyTheme(this._themeMode());
    });

    // Listen for system theme changes when in auto mode
    this.setupSystemThemeListener();
  }

  /**
   * Set theme mode
   */
  setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
    this.saveThemePreference(mode);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newMode = this._isDarkMode() ? 'light' : 'dark';
    this.setThemeMode(newMode);
  }

  /**
   * Load theme preference from localStorage
   */
  private loadThemePreference(): void {
    const saved = localStorage.getItem('portfolio-theme') as ThemeMode;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      this._themeMode.set(saved);
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(mode: ThemeMode): void {
    localStorage.setItem('portfolio-theme', mode);
  }

  /**
   * Apply theme based on mode
   */
  private applyTheme(mode: ThemeMode): void {
    let isDark = false;

    switch (mode) {
      case 'light':
        isDark = false;
        break;
      case 'dark':
        isDark = true;
        break;
      case 'auto':
        // Check system preference
        isDark = this.getSystemThemePreference();
        break;
    }

    this._isDarkMode.set(isDark);
    this.updateDocumentTheme(isDark);
    this.updateTerminalTheme(isDark);
  }

  /**
   * Update document theme class and CSS variables
   */
  private updateDocumentTheme(isDark: boolean): void {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Update CSS custom properties
    this.updateCSSVariables(isDark);
  }

  /**
   * Update CSS variables based on theme
   */
  private updateCSSVariables(isDark: boolean): void {
    const root = document.documentElement;

    if (isDark) {
      // Dark theme colors
      root.style.setProperty('--bg-desktop', '#1a1a2e');
      root.style.setProperty('--bg-window', '#16213e');
      root.style.setProperty('--text-main', '#eee');
      root.style.setProperty('--accent-terminal', '#00ff41');
      root.style.setProperty('--bg-taskbar', '#0f3460');
      root.style.setProperty('--color-border-final', '#333');
    } else {
      // Reset to default light theme (from styles.css)
      root.style.removeProperty('--bg-desktop');
      root.style.removeProperty('--bg-window');
      root.style.removeProperty('--text-main');
      root.style.removeProperty('--accent-terminal');
      root.style.removeProperty('--bg-taskbar');
      root.style.removeProperty('--color-border-final');
    }
  }

  /**
   * Update terminal theme when global theme changes
   */
  private updateTerminalTheme(isDark: boolean): void {
    const terminalElements = document.querySelectorAll('.terminal-content');

    terminalElements.forEach(terminal => {
      if (isDark) {
        (terminal as HTMLElement).style.background = '#0d1117';
        (terminal as HTMLElement).style.color = '#c9d1d9';
      } else {
        (terminal as HTMLElement).style.background = '#2d2d2d';
        (terminal as HTMLElement).style.color = '#d4d4d4';
      }
    });
  }

  /**
   * Get system theme preference
   */
  private getSystemThemePreference(): boolean {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', () => {
        if (this._themeMode() === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  /**
   * Get current theme information
   */
  getThemeInfo() {
    return {
      mode: this._themeMode(),
      isDark: this._isDarkMode(),
      systemDark: this.getSystemThemePreference()
    };
  }

  /**
   * Get theme-friendly color classes
   */
  getThemeClasses() {
    return {
      text: this._isDarkMode() ? 'text-dark' : 'text-light',
      bg: this._isDarkMode() ? 'bg-dark' : 'bg-light',
      border: this._isDarkMode() ? 'border-dark' : 'border-light',
      accent: this._isDarkMode() ? 'accent-dark' : 'accent-light'
    };
  }

  /**
   * Reset theme to default
   */
  resetTheme(): void {
    this.setThemeMode('auto');
  }
}