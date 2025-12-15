import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  @Input() windowTop: string = '60px';
  @Input() windowLeft: string = '440px';
  @Input() windowWidth: string = '750px';
  @Input() windowHeight: string = '500px';
  @Input() windowZIndex: number = 100;

  protected readonly navigationService = inject(Navigation);

  protected get isMaximized(): boolean {
    const tab = this.navigationService.tabs().find(t => t.id === 'about');
    return tab?.maximized ?? false;
  }

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'about',
      title: 'About Me',
    });
  }

  protected minimizeWindow(): void {
    this.navigationService.toggleMinimize('about');
  }

  protected closeWindow(): void {
    this.navigationService.closeTab('about');
  }

  protected maximizeWindow(): void {
    this.navigationService.maximizeTab('about');
  }
}
