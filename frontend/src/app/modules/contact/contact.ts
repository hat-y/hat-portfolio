import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';
import { DataService, Profile } from '../../core/services/data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  protected readonly navigationService = inject(Navigation);
  private readonly dataService = inject(DataService);
  
  protected profile = signal<Profile | null>(null);
  protected loading = signal<boolean>(true);

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'contact',
      title: 'Contact',
    });
    
    // Cargar datos de contacto desde JSON
    this.dataService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading contact data:', err);
        this.loading.set(false);
      }
    });
  }

  protected downloadCV(): void {
    // TODO: Implementar descarga de CV
    console.log('Downloading CV...');
  }
}
