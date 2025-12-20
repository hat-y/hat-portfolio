import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navigation } from '../../core/services/navigation';
import { DataService, SkillCategory } from '../../core/services/data.service';
import { SharedModule } from '../../shared/shared.module';
import { CardComponent } from '../../shared/components/card/card.component';

interface StarRating {
  filled: boolean;
  label: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  protected readonly navigationService: Navigation = inject(Navigation);
  private readonly dataService = inject(DataService);

  protected currentCategory: WritableSignal<SkillCategory | null> = signal(null);
  protected categories = signal<SkillCategory[]>([]);
  protected loading = signal<boolean>(true);
  protected searchTerm = signal<string>('');
  private navigationHistory: SkillCategory[] = [];
  private historyIndex: number = -1;

  protected currentPath = computed(() => {
    if (!this.currentCategory()) {
      return 'TechStack';
    }
    return `TechStack\\${this.currentCategory()!.name}`;
  });

  // Categorías filtradas por búsqueda
  protected filteredCategories = computed(() => {
    const categories = this.categories();
    const term = this.searchTerm();

    if (!term) return categories;

    return categories.filter(category =>
      category.name.toLowerCase().includes(term.toLowerCase()) ||
      category.skills.some(skill =>
        skill.name.toLowerCase().includes(term.toLowerCase()) ||
        skill.description.toLowerCase().includes(term.toLowerCase())
      )
    );
  });

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

    // Add to navigation history
    this.navigationHistory = this.navigationHistory.slice(0, this.historyIndex + 1);
    this.navigationHistory.push(category);
    this.historyIndex++;
  }

  protected goBack(): void {
    if (this.navigationHistory.length > 0 && this.historyIndex > 0) {
      this.historyIndex--;
      this.currentCategory.set(this.navigationHistory[this.historyIndex]);
    } else {
      this.currentCategory.set(null);
      this.navigationHistory = [];
      this.historyIndex = -1;
    }
  }

  protected goForward(): void {
    if (this.historyIndex < this.navigationHistory.length - 1) {
      this.historyIndex++;
      this.currentCategory.set(this.navigationHistory[this.historyIndex]);
    }
  }

  protected canGoForward(): boolean {
    return this.historyIndex < this.navigationHistory.length - 1;
  }

  protected goUp(): void {
    this.goBack();
  }

  protected getStars(rating: number): StarRating[] {
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < rating,
      label: `${i < rating ? 'Filled' : 'Empty'} star ${i + 1} of 5`,
    }));
  }

  protected getSkillIcon(skillName: string): string {
    const icons: Record<string, string> = {
      'Angular': '🅰️',
      'React/Next.js': '⚛️',
      'TypeScript': '📘',
      'JavaScript (ES6+)': '📜',
      'Node.js': '🟢',
      'Python': '🐍',
      'SQL': '📊',
      'MongoDB': '🍃',
      'Docker': '🐳',
      'Git': '📦',
      'AWS': '☁️',
      'Figma': '🎨',
      'CSS/Sass': '🎨',
      'Testing': '🧪',
      'Build Tools': '🔧',
      'CI/CD': '🔄',
      'Deployment': '🚀',
      'Responsive Design': '📱',
      'Accessibility': '♿',
    };
    return icons[skillName] || '📄';
  }

  protected getStatusBarText(): string {
    const categories = this.filteredCategories().length;
    if (!this.currentCategory()) {
      return `${categories} directories`;
    }
    return `${this.currentCategory()!.skills.length} technologies`;
  }

  protected onMenuClick(menu: string): void {
    if (menu === 'help') {
      alert('Technical Skills Explorer\n\nBrowse through sections to explore portfolio content.\nUse search to find specific technologies.\n\n📂 Navigate portfolio sections');
    }
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected goHome(): void {
    this.currentCategory.set(null);
    this.searchTerm.set('');
  }

  protected navigateToSection(section: string): void {
    // Navigate to different portfolio sections
    switch (section) {
      case 'about':
        // Navigate to About section
        window.location.hash = '#about';
        break;
      case 'projects':
        // Navigate to Projects section
        window.location.hash = '#projects';
        break;
      case 'contact':
        // Navigate to Contact section
        window.location.hash = '#contact';
        break;
      case 'home':
        // Navigate to portfolio home
        window.location.hash = '';
        break;
      default:
        console.log(`Navigate to section: ${section}`);
    }
  }

  protected openCategoryByName(categoryName: string): void {
    const category = this.categories().find(cat => cat.name === categoryName);
    if (category) {
      this.currentCategory.set(category);
    }
  }

  protected getSkillLevel(rating: number): string {
    if (rating >= 5) return 'Expert';
    if (rating >= 4) return 'Advanced';
    if (rating >= 3) return 'Intermediate';
    if (rating >= 2) return 'Junior';
    return 'Beginner';
  }

  protected getTotalSkills(): number {
    return this.categories().reduce((total, category) => total + category.skills.length, 0);
  }

  protected getAverageRating(category: SkillCategory): number {
    if (!category.skills.length) return 0;
    const sum = category.skills.reduce((total, skill) => total + skill.rating, 0);
    return sum / category.skills.length;
  }
}
