import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Tab } from './navigation';

// Usar el objeto window global directamente (Angular ya tiene las definiciones)

export interface WindowPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type LayoutMode = 'grid' | 'main-horizontal' | 'main-vertical' | 'floating';

@Injectable({
  providedIn: 'root',
})
export class TilingService {
  private readonly _layoutMode: WritableSignal<LayoutMode> = signal<LayoutMode>('floating');
  private readonly _windowGap = signal(24);
  private readonly _margin = signal(40);
  // Header height calculation: offset(8) + taskbar_height(28) + padding(4) + border(2) + gap(8) = 50
  private readonly _headerHeight = 50;
  private readonly _lockPositions = signal(false);

  readonly layoutMode = this._layoutMode.asReadonly();

  // Calcula positions basado en el layout actual
  calculateWindowPositions(windows: Tab[], activeWindowId: string): Map<string, WindowPosition> {
    const openWindows = windows
      .filter(w => w.open && !w.minimized && !w.maximized)
      // Orden consistente por orden de registro, no por z-index
      .sort((a, b) => {
        // Para layouts stack, la ventana activa va primero
        if (this._layoutMode() !== 'grid') {
          if (a.id === activeWindowId) return -1;
          if (b.id === activeWindowId) return 1;
        }
        // Mantener orden consistente por ID para grid layout
        return a.id.localeCompare(b.id);
      });

    const positions = new Map<string, WindowPosition>();

    if (openWindows.length === 0) return positions;

    switch (this._layoutMode()) {
      case 'grid':
        this.calculateGridLayout(openWindows, positions);
        break;
      case 'main-horizontal':
        this.calculateMainHorizontalLayout(openWindows, positions);
        break;
      case 'main-vertical':
        this.calculateMainVerticalLayout(openWindows, positions);
        break;
      case 'floating':
        this.calculateFloatingLayout(openWindows, positions);
        break;
    }

    return positions;
  }

  calculateFloatingPositions(
    tabs: Tab[],
    currentPositions: Map<string, WindowPosition>,
  ): Map<string, WindowPosition> {
    const newPositions = new Map<string, WindowPosition>(currentPositions);
    const openWindows = tabs.filter((t) => t.open && !t.minimized && !t.maximized);
    const { headerHeight, margin, availableWidth, availableHeight } = this.getDimensions();

    // Preferred dimensions for single window - UX optimized for desktop portfolio content
    // 1000×620px provides comfortable viewing space without being overwhelming
    const preferredWidth = 1000;
    const preferredHeight = 620;
    const offset = 30;

    // Remove positions for closed windows
    for (const id of newPositions.keys()) {
      if (!openWindows.some((w) => w.id === id)) {
        newPositions.delete(id);
      }
    }

    // If there is only one window, center it with preferred size
    if (openWindows.length === 1) {
      const window = openWindows[0];

      // Use preferred size, but ensure it fits within viewport
      const width = Math.min(preferredWidth, availableWidth - (margin * 2));
      const height = Math.min(preferredHeight, availableHeight);

      // Center in available space
      const centeredLeft = margin + (availableWidth - width) / 2;
      const centeredTop = headerHeight + margin + (availableHeight - height) / 2;

      newPositions.set(window.id, {
        top: centeredTop,
        left: centeredLeft,
        width: width,
        height: height
      });
      return newPositions;
    }

    // Add positions for new windows (cascade if more than one)
    openWindows.forEach((window, index) => {
      if (!newPositions.has(window.id)) {
        // For multiple windows, use base size and cascade
        const newPosition = {
          top: headerHeight + margin + (index * offset),
          left: margin + (index * offset),
          width: Math.min(preferredWidth, availableWidth - (margin * 2)),
          height: Math.min(preferredHeight, availableHeight),
        };
        newPositions.set(window.id, newPosition);
      }
    });

    return newPositions;
  }

  private getDimensions() {
    // Safe window access with fallbacks
    const isBrowser = typeof window !== 'undefined' && window.innerWidth;
    const windowWidth = isBrowser ? window.innerWidth : 1200;
    const windowHeight = isBrowser ? window.innerHeight : 800;

    return {
      headerHeight: this._headerHeight,
      availableWidth: windowWidth - (this._margin() * 2),
      availableHeight: windowHeight - this._headerHeight - (this._margin() * 2),
      margin: this._margin(),
      gap: this._windowGap()
    };
  }

  private calculateGridLayout(windows: Tab[], positions: Map<string, WindowPosition>): void {
    const count = windows.length;
    if (count === 0) return;

    const { headerHeight, availableWidth, availableHeight, margin, gap } = this.getDimensions();

    // Para una sola ventana, usar 85% del espacio disponible
    if (count === 1) {
      const width = availableWidth * 0.85;
      const height = availableHeight * 0.85;

      // Calcular posición centrada
      const centeredLeft = margin + (availableWidth - width) / 2;
      const centeredTop = headerHeight + margin + (availableHeight - height) / 2;

      positions.set(windows[0].id, {
        top: centeredTop,
        left: centeredLeft,
        width: width,
        height: height
      });
      return;
    }

    // Determinar grid size óptimo
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const cellWidth = (availableWidth - gap * (cols - 1)) / cols;
    const cellHeight = (availableHeight - gap * (rows - 1)) / rows;

    windows.forEach((window, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      positions.set(window.id, {
        top: headerHeight + margin + row * (cellHeight + gap),
        left: margin + col * (cellWidth + gap),
        width: cellWidth,
        height: cellHeight
      });
    });
  }

  private calculateMainHorizontalLayout(windows: Tab[], positions: Map<string, WindowPosition>): void {
    if (windows.length === 0) return;

    const { headerHeight, availableWidth, availableHeight, margin, gap } = this.getDimensions();
    const mainRatio = 0.6;

    const mainWindow = windows[0]; // Primera ventana (activa)
    const stackWindows = windows.slice(1);

    // Para una sola ventana, centrarla con tamaño optimizado
    if (windows.length === 1) {
      const preferredWidth = 720;
      const preferredHeight = 480;

      // Calcular posición centrada
      const centeredLeft = Math.max(margin, (window.innerWidth - preferredWidth) / 2);
      const centeredTop = headerHeight + Math.max(margin, (availableHeight - preferredHeight) / 2);

      positions.set(mainWindow.id, {
        top: centeredTop,
        left: centeredLeft,
        width: Math.min(preferredWidth, availableWidth),
        height: Math.min(preferredHeight, availableHeight)
      });
      return;
    }

    // Main window - ocupa 60% superior pero no más del preferred width
    const maxMainWidth = 800;
    const mainWidth = Math.min(availableWidth * mainRatio, maxMainWidth);

    positions.set(mainWindow.id, {
      top: headerHeight + margin,
      left: margin,
      width: mainWidth,
      height: availableHeight * mainRatio - gap / 2
    });

    // Stack windows - ocupan 40% inferior
    if (stackWindows.length > 0) {
      const stackHeight = availableHeight * (1 - mainRatio);
      const stackItemWidth = (availableWidth - gap * (stackWindows.length - 1)) / stackWindows.length;

      stackWindows.forEach((window, index) => {
        positions.set(window.id, {
          top: headerHeight + margin + (availableHeight * mainRatio) + gap,
          left: margin + index * (stackItemWidth + gap),
          width: stackItemWidth,
          height: stackHeight - gap
        });
      });
    }
  }

  private calculateMainVerticalLayout(windows: Tab[], positions: Map<string, WindowPosition>): void {
    if (windows.length === 0) return;

    const { headerHeight, availableWidth, availableHeight, margin, gap } = this.getDimensions();
    const mainRatio = 0.6;

    const mainWindow = windows[0]; // Primera ventana (activa)
    const stackWindows = windows.slice(1);

    // Para una sola ventana, centrarla con tamaño optimizado
    if (windows.length === 1) {
      const preferredWidth = 720;
      const preferredHeight = 480;

      // Calcular posición centrada
      const centeredLeft = Math.max(margin, (window.innerWidth - preferredWidth) / 2);
      const centeredTop = headerHeight + Math.max(margin, (availableHeight - preferredHeight) / 2);

      positions.set(mainWindow.id, {
        top: centeredTop,
        left: centeredLeft,
        width: Math.min(preferredWidth, availableWidth),
        height: Math.min(preferredHeight, availableHeight)
      });
      return;
    }

    // Main window - ocupa 60% izquierdo pero no más del preferred width
    const maxMainWidth = 800;
    const mainWidth = Math.min(availableWidth * mainRatio, maxMainWidth);

    positions.set(mainWindow.id, {
      top: headerHeight + margin,
      left: margin,
      width: mainWidth,
      height: availableHeight
    });

    // Stack windows - ocupan 40% derecho
    if (stackWindows.length > 0) {
      const stackWidth = availableWidth * (1 - mainRatio);
      const stackItemHeight = (availableHeight - gap * (stackWindows.length - 1)) / stackWindows.length;

      stackWindows.forEach((window, index) => {
        positions.set(window.id, {
          top: headerHeight + margin + index * (stackItemHeight + gap),
          left: margin + (availableWidth * mainRatio) + gap,
          width: stackWidth - gap,
          height: stackItemHeight
        });
      });
    }
  }

  private calculateFloatingLayout(windows: Tab[], positions: Map<string, WindowPosition>): void {
    const { headerHeight, margin } = this.getDimensions();
    const baseWidth = 1000;
    const baseHeight = 620;
    const offset = 30;

    windows.forEach((windowTab, index) => {
      // Para una sola ventana, centrarla con tamaño optimizado
      if (windows.length === 1) {
        const preferredWidth = 1000;
        const preferredHeight = 620;

        // Calcular posición centrada con safe window access
        const isBrowser = typeof window !== 'undefined' && window.innerWidth;
        const browserWidth = isBrowser ? window.innerWidth : 1200;
        const browserHeight = isBrowser ? window.innerHeight : 800;

        const centeredLeft = Math.max(margin, (browserWidth - preferredWidth) / 2);
        const centeredTop = headerHeight + Math.max(margin, (browserHeight - headerHeight - 100 - preferredHeight) / 2);

        positions.set(windowTab.id, {
          top: centeredTop,
          left: centeredLeft,
          width: Math.min(preferredWidth, browserWidth - margin * 2),
          height: Math.min(preferredHeight, browserHeight - headerHeight - 100)
        });
        return;
      }

      positions.set(windowTab.id, {
        top: headerHeight + margin + (index * offset),
        left: margin + (index * offset),
        width: baseWidth,
        height: baseHeight
      });
    });
  }

  // Cambiar layout
  setLayoutMode(mode: LayoutMode): void {
    this._layoutMode.set(mode);
  }

  // Obtener layout actual
  getCurrentLayout(): LayoutMode {
    return this._layoutMode();
  }

  // Bloquear/desbloquear posiciones para que no cambien al hacer clic
  setLockPositions(locked: boolean): void {
    this._lockPositions.set(locked);
  }

  isLocked(): boolean {
    return this._lockPositions();
  }

  // Navegación entre ventanas (para futuras implementaciones)
  getNextWindow(currentId: string, direction: 'left' | 'right' | 'up' | 'down'): string | null {
    // Esto requeriría conocimiento de las positions actuales
    // Por ahora, retornamos null
    return null;
  }
}