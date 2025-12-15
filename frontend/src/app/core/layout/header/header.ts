import { Component, signal, computed, OnDestroy, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../services/navigation';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private readonly navigationService = inject(Navigation);

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
}
