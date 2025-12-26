import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
  role?: string;
  tech: string[];
  highlights?: string[];
  github: string;
  demo: string;
  featured: boolean;
  image?: string;
}

export interface Skill {
  name: string;
  rating: number;
  description: string;
  isTopSkill?: boolean;
}

export interface SkillCategory {
  folder: string;
  name: string;
  icon: string;
  skills: Skill[];
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  avatar?: string;
  bio: string[];
  stats: {
    experience: string;
    projects: string;
    technologies: string;
  };
  coreSkills: string[];
  interests: string;
  contact: {
    email: string;
    linkedin: string;
    github: string;
    location?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly basePath = 'assets/data';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.basePath}/projects.json`);
  }

  getSkills(): Observable<SkillCategory[]> {
    return this.http.get<SkillCategory[]>(`${this.basePath}/skills.json`);
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.basePath}/profile.json`);
  }
}
