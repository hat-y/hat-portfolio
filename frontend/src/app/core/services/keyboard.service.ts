import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TilingService } from './tiling.service';

export interface Keybinding {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class KeyboardService implements OnDestroy {
  private readonly tilingService = inject(TilingService);
  private readonly keybindings = signal<Map<string, Keybinding>>(new Map());
  private readonly layoutChanged = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.setupDefaultKeybindings();
    this.setupKeyboardListener();
  }

  private setupDefaultKeybindings(): void {
    // Layout switchers
    this.registerKeybinding({
      id: 'layout-grid',
      keys: ['Meta+g', 'Ctrl+g'],
      description: 'Switch to grid layout',
      action: () => {
        this.tilingService.setLayoutMode('grid');
        this.layoutChanged.next('grid');
      },
    });

    this.registerKeybinding({
      id: 'layout-main-horizontal',
      keys: ['Meta+h', 'Ctrl+h'],
      description: 'Switch to main + horizontal stack',
      action: () => {
        this.tilingService.setLayoutMode('main-horizontal');
        this.layoutChanged.next('main-horizontal');
      },
    });

    this.registerKeybinding({
      id: 'layout-main-vertical',
      keys: ['Meta+v', 'Ctrl+v'],
      description: 'Switch to main + vertical stack',
      action: () => {
        this.tilingService.setLayoutMode('main-vertical');
        this.layoutChanged.next('main-vertical');
      },
    });

    this.registerKeybinding({
      id: 'layout-floating',
      keys: ['Meta+f', 'Ctrl+f'],
      description: 'Switch to floating layout',
      action: () => {
        this.tilingService.setLayoutMode('floating');
        this.layoutChanged.next('floating');
      },
    });

    // Help shortcut
    this.registerKeybinding({
      id: 'help-shortcuts',
      keys: ['Meta+?', 'Ctrl+?'],
      description: 'Show keyboard shortcuts',
      action: () => {
        this.showKeybindingHelp();
      },
    });
  }

  private setupKeyboardListener(): void {
    const keydown$ = fromEvent<KeyboardEvent>(window, 'keydown');
    const keyup$ = fromEvent<KeyboardEvent>(window, 'keyup');

    // Listen for key combinations
    merge(keydown$, keyup$)
      .pipe(
        takeUntil(this.destroy$),
        filter((event): event is KeyboardEvent => event.type === 'keydown'),
        map((event) => ({
          event,
          keyCombo: this.getKeyCombo(event),
        })),
      )
      .subscribe(({ event, keyCombo }) => {
        const bindings = this.keybindings();

        // Find matching keybinding
        for (const binding of bindings.values()) {
          if (binding.keys.includes(keyCombo)) {
            // Prevent default behavior
            const activeElement = document.activeElement;
            const isInputElement =
              activeElement instanceof HTMLInputElement ||
              activeElement instanceof HTMLTextAreaElement ||
              activeElement?.getAttribute('contenteditable') === 'true';

            // Only prevent default if not typing in input fields
            if (!isInputElement) {
              event.preventDefault();
              event.stopPropagation();
            }

            binding.action();
            break;
          }
        }
      });
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.metaKey) parts.push('Meta');
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');

    // Handle special keys
    let key = event.key.toLowerCase();
    switch (key) {
      case ' ':
        key = 'space';
        break;
      case 'escape':
        key = 'esc';
        break;
      case 'arrowup':
        key = 'up';
        break;
      case 'arrowdown':
        key = 'down';
        break;
      case 'arrowleft':
        key = 'left';
        break;
      case 'arrowright':
        key = 'right';
        break;
    }

    parts.push(key);

    return parts.join('+');
  }

  // Register new keybinding
  registerKeybinding(keybinding: Keybinding): void {
    const bindings = this.keybindings();
    bindings.set(keybinding.id, keybinding);
    this.keybindings.set(new Map(bindings));
  }

  // Remove keybinding
  unregisterKeybinding(id: string): void {
    const bindings = this.keybindings();
    bindings.delete(id);
    this.keybindings.set(new Map(bindings));
  }

  // Get all keybindings
  getKeybindings(): Keybinding[] {
    return Array.from(this.keybindings().values());
  }

  // Layout change observable
  onLayoutChanged() {
    return this.layoutChanged.asObservable();
  }

  private showKeybindingHelp(): void {
    const bindings = this.getKeybindings();
    console.log('%c Keyboard Shortcuts:', 'font-weight: bold; font-size: 14px; color: #88c090;');
    console.table(
      bindings.map((b) => ({
        Keys: b.keys.join(', '),
        Description: b.description,
      })),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutChanged.complete();
  }
}
