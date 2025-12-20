import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navigation } from '../core/services/navigation';

@Component({
  selector: 'app-terminal-route',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class TerminalRouteComponent implements OnInit {
  constructor(private navigationService: Navigation, private router: Router) {}

  ngOnInit(): void {
    this.navigationService.openTab('terminal');
    this.router.navigate(['/']);
  }
}
