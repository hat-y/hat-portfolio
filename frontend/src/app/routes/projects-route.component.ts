import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navigation } from '../core/services/navigation';

@Component({
  selector: 'app-projects-route',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class ProjectsRouteComponent implements OnInit {
  constructor(private navigationService: Navigation, private router: Router) {}

  ngOnInit(): void {
    this.navigationService.openTab('projects');
    this.router.navigate(['/']);
  }
}
