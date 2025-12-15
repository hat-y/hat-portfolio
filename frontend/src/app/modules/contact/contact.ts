import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  @Input() windowTop: string = '300px';
  @Input() windowLeft: string = '640px';
  @Input() windowWidth: string = '750px';
  @Input() windowHeight: string = '500px';
  @Input() windowZIndex: number = 100;

  protected readonly navigationService = inject(Navigation);

  protected get isMaximized(): boolean {
    const tab = this.navigationService.tabs().find(t => t.id === 'contact');
    return tab?.maximized ?? false;
  }

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'contact',
      title: 'Contact',
    });
  }

  protected minimizeWindow(): void {
    this.navigationService.toggleMinimize('contact');
  }

  protected closeWindow(): void {
    this.navigationService.closeTab('contact');
  }

  protected maximizeWindow(): void {
    this.navigationService.maximizeTab('contact');
  }

  protected downloadCV(): void {
    // TODO: Implementar descarga de CV
    console.log('Downloading CV...');
  }
}
