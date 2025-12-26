import { Injectable, signal, Signal, WritableSignal, effect, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export interface Tab {
  id: string;
  title: string;
  active: boolean;
  minimized: boolean;
  open: boolean;
  maximized: boolean;
  zIndex: number;
  component?: any;
}

// Window position interface for consistency
export interface WindowPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  private readonly _tabs: WritableSignal<Tab[]> = signal<Tab[]>([]);
  private readonly _isReady: WritableSignal<boolean> = signal(false);
  private zIndexCounter = 100;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Prevent infinite loops
  private _isNavigating = false;
  private _lastSyncedUrl = '';

  readonly tabs: Signal<Tab[]> = this._tabs.asReadonly();
  readonly isReady: Signal<boolean> = this._isReady.asReadonly();

  constructor() {
    effect(() => {
      if (!this.isReady()) return;
      if (this._isNavigating) return; // Skip if we're already navigating

      const tabs = this._tabs();
      const openTabs = tabs.filter(t => t.open && !t.minimized).map(t => t.id).join(',');
      const activeTab = tabs.find(t => t.active && !t.minimized);

      const newUrl = `${openTabs}|${activeTab?.id || ''}`;

      // Only navigate if URL actually changed
      if (newUrl === this._lastSyncedUrl) return;

      const queryParams: { [key: string]: string | null } = {};
      if (openTabs) {
        queryParams['open'] = openTabs;
      }
      if (activeTab) {
        queryParams['active'] = activeTab.id;
      }

      this._lastSyncedUrl = newUrl;
      this._isNavigating = true;

      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : null,
        queryParamsHandling: 'merge',
        replaceUrl: true
      }).then(() => {
        // Reset flag after navigation completes
        setTimeout(() => {
          this._isNavigating = false;
        }, 0);
      });
    });
  }

  setReady(isReady: boolean): void {
    this._isReady.set(isReady);
  }

  initializeFromUrl(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    const openParam = params['open'];
    const activeParam = params['active'];

    // Prevent triggering effect during initialization
    this._isNavigating = true;

    if (openParam) {
      const openIds = openParam.split(',');
      this._tabs.update(tabs => {
        return tabs.map(tab => {
          if (openIds.includes(tab.id)) {
            return { ...tab, open: true, minimized: false };
          }
          return { ...tab, open: false };
        });
      });
    }

    if (activeParam) {
      this.setActiveTab(activeParam);
    }

    // Store current URL state
    const openTabs = this._tabs().filter(t => t.open && !t.minimized).map(t => t.id).join(',');
    const activeTab = this._tabs().find(t => t.active && !t.minimized);
    this._lastSyncedUrl = `${openTabs}|${activeTab?.id || ''}`;

    // Allow effect to run after a delay
    setTimeout(() => {
      this._isNavigating = false;
      this.setReady(true);
    }, 100);
  }

  registerTab(tab: Omit<Tab, 'active' | 'minimized' | 'open' | 'maximized' | 'zIndex'>): void {
    this._tabs.update((tabs: Tab[]): Tab[] => {
      if (tabs.some((t: Tab): boolean => t.id === tab.id)) {
        return tabs;
      }
      const isFirstTab = tabs.length === 0;
      const newTab = {
        ...tab,
        active: isFirstTab,
        minimized: false,
        open: isFirstTab,
        maximized: false,
        zIndex: this.zIndexCounter++,
      };

      const updatedTabs = [...tabs, newTab];
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  private ensureActiveWindow(tabs: Tab[]): Tab[] {
    const openTabs = tabs.filter((t) => t.open && !t.minimized);

    if (openTabs.length === 0) {
      return tabs;
    }

    const hasActiveOpenTab = openTabs.some((t) => t.active);
    if (!hasActiveOpenTab) {
      const firstOpenTabId = openTabs[0].id;
      return tabs.map((tab) => ({
        ...tab,
        active: tab.id === firstOpenTabId,
        zIndex: tab.id === firstOpenTabId ? this.zIndexCounter++ : tab.zIndex,
      }));
    }

    return tabs;
  }
  
  setActiveTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      return tabs.map((tab) => ({
        ...tab,
        active: tab.id === tabId,
        open: tab.id === tabId ? true : tab.open,
        minimized: tab.id === tabId ? false : tab.minimized,
        zIndex: tab.id === tabId ? this.zIndexCounter++ : tab.zIndex,
      }));
    });
  }

  toggleMinimize(tabId: string): void {
    this._tabs.update((tabs: Tab[]): Tab[] => {
      const updatedTabs = tabs.map(
        (tab: Tab): Tab =>
          tab.id === tabId
            ? {
                ...tab,
                minimized: !tab.minimized,
                active: tab.minimized ? true : false,
                maximized: false,
              }
            : tab,
      );
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  closeTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]): Tab[] => {
      const updatedTabs = tabs.map(
        (tab: Tab): Tab =>
          tab.id === tabId
            ? { ...tab, open: false, minimized: true, active: false, maximized: false }
            : tab,
      );
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  openTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      const updatedTabs = tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              open: true,
              minimized: false,
              active: true,
              maximized: false,
              zIndex: this.zIndexCounter++,
            }
          : { ...tab, active: false },
      );
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  maximizeTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      const targetTab = tabs.find((t) => t.id === tabId);
      const isMaximizing = !targetTab?.maximized;

      return tabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            minimized: false,
            active: true,
            maximized: isMaximizing,
            zIndex: isMaximizing ? this.zIndexCounter++ : tab.zIndex,
          };
        } else {
          return {
            ...tab,
            active: isMaximizing ? false : tab.active,
            maximized: false, 
          };
        }
      });
    });
  }

  getActiveTab(): Tab | undefined {
    return this._tabs().find((tab: Tab): boolean => tab.active);
  }
}
