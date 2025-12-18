import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Profile } from '../../core/services/data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-content.html',
  styleUrl: './about-content.css',
})
export class About implements OnInit {
  private readonly dataService = inject(DataService);

  protected profile = signal<Profile | null>(null);
  protected loading = signal<boolean>(true);

  ngOnInit(): void {
    // Cargar perfil desde JSON
    this.dataService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.loading.set(false);
      }
    });
  }
}
