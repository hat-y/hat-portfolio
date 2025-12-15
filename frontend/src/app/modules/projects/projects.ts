import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  @Input() windowTop: string = '300px';
  @Input() windowLeft: string = '240px';
  @Input() windowWidth: string = '750px';
  @Input() windowHeight: string = '500px';
  @Input() windowZIndex: number = 100;

  protected readonly navigationService = inject(Navigation);

  protected get isMaximized(): boolean {
    const tab = this.navigationService.tabs().find(t => t.id === 'projects');
    return tab?.maximized ?? false;
  }

  protected readonly projects = [
    {
      name: 'Project 1',
      description: 'Description of project 1',
      tech: ['Angular', 'TypeScript', 'Node.js'],
      github: 'https://github.com/you/project1',
      demo: 'https://project1.com'
    },
    {
      name: 'Project 2',
      description: 'Description of project 2',
      tech: ['React', 'Next.js', 'TailwindCSS'],
      github: 'https://github.com/you/project2',
      demo: 'https://project2.com'
    }
  ];

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'projects',
      title: 'Projects',
    });
  }

  protected minimizeWindow(): void {
    this.navigationService.toggleMinimize('projects');
  }

  protected closeWindow(): void {
    this.navigationService.closeTab('projects');
  }

  protected maximizeWindow(): void {
    this.navigationService.maximizeTab('projects');
  }
}
