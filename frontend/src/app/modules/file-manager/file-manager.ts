import { Component, OnInit, Input, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';

interface Skill {
  name: string;
  rating: number;
  description: string;
}

interface SkillCategory {
  name: string;
  folder: string;
  icon: string;
  skills: Skill[];
}

@Component({
  selector: 'app-file-manager',
  imports: [CommonModule],
  templateUrl: './file-manager.html',
  styleUrl: './file-manager.css'
})
export class FileManager implements OnInit {
  @Input() windowTop: string = '60px';
  @Input() windowLeft: string = '840px';
  @Input() windowWidth: string = '750px';
  @Input() windowHeight: string = '500px';
  @Input() windowZIndex: number = 100;

  protected readonly navigationService = inject(Navigation);
  
  protected currentPath: WritableSignal<string> = signal('skills');
  protected currentCategory: WritableSignal<SkillCategory | null> = signal(null);

  protected get isMaximized(): boolean {
    const tab = this.navigationService.tabs().find(t => t.id === 'file-manager');
    return tab?.maximized ?? false;
  }
  
  protected readonly categories: SkillCategory[] = [
    {
      name: 'Languages',
      folder: 'languages',
      icon: '💻',
      skills: [
        { name: 'JavaScript', rating: 5, description: 'Core language for full-stack development' },
        { name: 'TypeScript', rating: 5, description: 'Preferred for type safety and scalability' },
        { name: 'Python', rating: 4, description: 'Scripting, automation, data processing' },
        { name: 'SQL', rating: 4, description: 'PostgreSQL, MySQL - database queries' },
        { name: 'HTML/CSS', rating: 4, description: 'Semantic HTML, responsive design' }
      ]
    },
    {
      name: 'Frameworks & Libraries',
      folder: 'frameworks-and-libraries',
      icon: '📦',
      skills: [
        { name: 'Node.js', rating: 5, description: 'Backend runtime - REST APIs, microservices' },
        { name: 'Express.js', rating: 4, description: 'Web framework - routing, middleware' },
        { name: 'Angular', rating: 4, description: 'Frontend framework - SPAs, signals' },
        { name: 'React', rating: 3, description: 'UI library - hooks, context' },
        { name: 'Prisma ORM', rating: 4, description: 'Database toolkit - migrations, queries' },
        { name: 'RxJS', rating: 3, description: 'Reactive programming - observables' }
      ]
    },
    {
      name: 'Tools',
      folder: 'tools',
      icon: '🛠️',
      skills: [
        { name: 'Git & GitHub', rating: 5, description: 'Version control, collaboration, CI/CD' },
        { name: 'Docker', rating: 4, description: 'Containerization, compose, deployment' },
        { name: 'Postman', rating: 4, description: 'API testing, documentation' },
        { name: 'VS Code', rating: 5, description: 'Primary IDE with extensions' },
        { name: 'Linux/Bash', rating: 4, description: 'Command line, scripting, server management' }
      ]
    },
    {
      name: 'Clouds & Providers',
      folder: 'clouds-and-providers',
      icon: '☁️',
      skills: [
        { name: 'AWS', rating: 3, description: 'EC2, S3, RDS - cloud infrastructure' },
        { name: 'Vercel', rating: 4, description: 'Frontend deployment, serverless functions' },
        { name: 'Railway', rating: 3, description: 'Backend deployment, databases' },
        { name: 'PostgreSQL Cloud', rating: 4, description: 'Neon, Supabase - managed databases' }
      ]
    }
  ];

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'file-manager',
      title: 'Skills',
      component: FileManager,
    });
  }

  protected openFolder(category: SkillCategory): void {
    this.currentCategory.set(category);
    this.currentPath.set(`skills/${category.folder}`);
  }

  protected goBack(): void {
    this.currentCategory.set(null);
    this.currentPath.set('skills');
  }

  protected minimizeWindow(): void {
    this.navigationService.toggleMinimize('file-manager');
  }

  protected closeWindow(): void {
    this.navigationService.closeTab('file-manager');
  }

  protected maximizeWindow(): void {
    this.navigationService.maximizeTab('file-manager');
  }


  protected getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
}
