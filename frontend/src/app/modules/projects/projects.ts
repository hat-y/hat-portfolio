import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';
import { DataService, Project } from '../../core/services/data.service';
import { SharedModule } from '../../shared/shared.module';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, SharedModule, CardComponent],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  protected readonly navigationService = inject(Navigation);
  private readonly dataService = inject(DataService);
  
  protected projects = signal<Project[]>([]);
  protected loading = signal<boolean>(true);

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'projects',
      title: 'Projects',
    });
    
    // Cargar proyectos desde JSON
    this.dataService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading.set(false);
      }
    });
  }
}
