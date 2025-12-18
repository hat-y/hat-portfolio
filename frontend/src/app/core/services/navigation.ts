import { Injectable, signal, Signal, WritableSignal } from '@angular/core';

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

  readonly tabs: Signal<Tab[]> = this._tabs.asReadonly();

  registerTab(tab: Omit<Tab, 'active' | 'minimized' | 'open' | 'maximized' | 'zIndex'>): void {
    this._tabs.update((tabs: Tab[]): Tab[] => {
      // Prevenir duplicados
      if (tabs.some((t: Tab): boolean => t.id === tab.id)) {
        return tabs;
      }
      const isFirstTab = tabs.length === 0;
      const maxZIndex = tabs.length > 0 ? Math.max(...tabs.map((t) => t.zIndex)) : 100;
      const newTab = {
        ...tab,
        active: isFirstTab,
        minimized: false,
        open: isFirstTab,
        maximized: false,
        zIndex: maxZIndex + 1,
      };

      const updatedTabs = [...tabs, newTab];

      // Asegurar que siempre haya una ventana activa cuando haya ventanas abiertas
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  private ensureActiveWindow(tabs: Tab[]): Tab[] {
    const openTabs = tabs.filter((t) => t.open && !t.minimized);

    // Si no hay ventanas abiertas y no minimizadas, no hacer nada
    if (openTabs.length === 0) {
      return tabs;
    }

    // Si no hay ninguna ventana activa entre las abiertas, activar la primera
    const hasActiveOpenTab = openTabs.some((t) => t.active);
    if (!hasActiveOpenTab) {
      const maxZIndex = Math.max(...tabs.map((t) => t.zIndex));
      const firstOpenTabId = openTabs[0].id;

      return tabs.map((tab) => ({
        ...tab,
        active: tab.id === firstOpenTabId,
        zIndex: tab.id === firstOpenTabId ? maxZIndex + 1 : tab.zIndex,
      }));
    }

    return tabs;
  }

  setActiveTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      const maxZIndex = Math.max(...tabs.map((t) => t.zIndex));
      const targetTab = tabs.find((t) => t.id === tabId);
      const isMaximized = targetTab?.maximized;

      return tabs.map((tab) => ({
        ...tab,
        active: tab.id === tabId,
        open: tab.id === tabId ? true : tab.open,
        minimized: tab.id === tabId ? false : tab.minimized,
        // No cambiar el estado maximized al cambiar de tab activa
        maximized: tab.maximized,
        zIndex: tab.id === tabId ? maxZIndex + 1 : tab.zIndex,
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

      // Asegurar que siempre haya una ventana activa después de minimizar/restaurar
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

      // Asegurar que siempre haya una ventana activa después de cerrar
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  openTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      const maxZIndex = Math.max(...tabs.map((t) => t.zIndex));
      const updatedTabs = tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              open: true,
              minimized: false,
              active: true,
              maximized: false,
              zIndex: maxZIndex + 1,
            }
          : { ...tab, active: false },
      );

      // Asegurar que siempre haya una ventana activa (aunque openTab ya establece active: true)
      return this.ensureActiveWindow(updatedTabs);
    });
  }

  maximizeTab(tabId: string): void {
    this._tabs.update((tabs: Tab[]) => {
      const targetTab = tabs.find((t) => t.id === tabId);
      const isMaximizing = !targetTab?.maximized;
      const maxZIndex = Math.max(...tabs.map((t) => t.zIndex));

      return tabs.map((tab) => {
        if (tab.id === tabId) {
          // La ventana que se está maximizando/minimizando
          return {
            ...tab,
            minimized: false,
            active: true,
            maximized: isMaximizing,
            zIndex: isMaximizing ? maxZIndex + 1 : tab.zIndex,
          };
        } else {
          // Las demás ventanas pierden el foco si se está maximizando otra
          return {
            ...tab,
            active: isMaximizing ? false : tab.active,
            maximized: false, // Solo puede haber una ventana maximizada a la vez
          };
        }
      });
    });
  }

  getActiveTab(): Tab | undefined {
    return this._tabs().find((tab: Tab): boolean => tab.active);
  }
}
