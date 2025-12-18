import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
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

  protected currentCategory: WritableSignal<SkillCategory | null> = signal(null);
  protected categories = signal<SkillCategory[]>([]);
  protected loading = signal<boolean>(true);

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'skills',
      title: 'Skills',
      component: Skills,
    });

    this.dataService.getSkills().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading skills:', err);
        this.loading.set(false);
      },
    });
  }

  protected openCategory(category: SkillCategory): void {
    this.currentCategory.set(category);
  }

  protected goBack(): void {
    this.currentCategory.set(null);
  }

  protected getStars(rating: number): StarRating[] {
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < rating,
      label: `${i < rating ? 'Filled' : 'Empty'} star ${i + 1} of 5`,
    }));
  }
}
