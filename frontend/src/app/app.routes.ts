import { Routes } from '@angular/router';
import { AboutRouteComponent } from './routes/about-route.component';
import { SkillsRouteComponent } from './routes/skills-route.component';
import { ProjectsRouteComponent } from './routes/projects-route.component';
import { ContactRouteComponent } from './routes/contact-route.component';
import { TerminalRouteComponent } from './routes/terminal-route.component';

export const routes: Routes = [
  { path: 'about', component: AboutRouteComponent },
  { path: 'skills', component: SkillsRouteComponent },
  { path: 'projects', component: ProjectsRouteComponent },
  { path: 'contact', component: ContactRouteComponent },
  { path: 'terminal', component: TerminalRouteComponent },
];

