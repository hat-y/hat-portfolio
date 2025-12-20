import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navigation } from '../core/services/navigation';

@Component({
  selector: 'app-skills-route',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class SkillsRouteComponent implements OnInit {
  constructor(private navigationService: Navigation, private router: Router) {}

  ngOnInit(): void {
    this.navigationService.openTab('skills');
    this.router.navigate(['/']);
  }
}
