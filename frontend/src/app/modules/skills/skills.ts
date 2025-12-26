import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';
import { DataService, SkillCategory } from '../../core/services/data.service';

interface StarRating {
  filled: boolean;
  label: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  protected readonly navigationService: Navigation = inject(Navigation);
  private readonly dataService = inject(DataService);

  protected skillsCategories = signal<SkillCategory[]>([]);
  protected loading = signal<boolean>(true);

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'skills',
      title: 'Skills',
      component: Skills,
    });

    this.dataService.getSkills().subscribe({
      next: (data) => {
        this.skillsCategories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading skills:', err);
        this.loading.set(false);
      },
    });
  }

  protected getStars(rating: number): StarRating[] {
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < rating,
      label: `${i < rating ? 'Filled' : 'Empty'} star ${i + 1} of 5`,
    }));
  }

  protected getSkillLevel(rating: number): string {
    if (rating >= 5) return 'Expert';
    if (rating >= 4) return 'Advanced';
    if (rating >= 3) return 'Intermediate';
    if (rating >= 2) return 'Junior';
    return 'Beginner';
  }
}
