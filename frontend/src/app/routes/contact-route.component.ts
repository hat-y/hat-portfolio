import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navigation } from '../core/services/navigation';

@Component({
  selector: 'app-contact-route',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class ContactRouteComponent implements OnInit {
  constructor(private navigationService: Navigation, private router: Router) {}

  ngOnInit(): void {
    this.navigationService.openTab('contact');
    this.router.navigate(['/']);
  }
}
