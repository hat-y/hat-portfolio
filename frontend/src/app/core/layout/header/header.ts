import { Component, signal, OnDestroy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tab {
  id: string;
  title: string;
  active: boolean;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  protected readonly currentTime = signal(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  );

  protected readonly tabs: WritableSignal<Tab[]> = signal<Tab[]>([
    { id: 'portfolio', title: 'Portfolio', active: true },
    { id: 'projects', title: 'Projects', active: false },
    { id: 'contact', title: 'Contact', active: false },
  ]);

  protected showStartMenu = signal(false);

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
    this.tabs.update((tabs) =>
      tabs.map((tab) => ({
        ...tab,
        active: tab.id === tabId,
      })),
    );
  }
}
