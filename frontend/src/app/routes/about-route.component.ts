import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navigation } from '../core/services/navigation';

@Component({
  selector: 'app-about-route',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class AboutRouteComponent implements OnInit {
  constructor(private navigationService: Navigation, private router: Router) {}

  ngOnInit(): void {
    // Pequeño delay para asegurar que el NavigationService está inicializado
    setTimeout(() => {
      this.navigationService.openTab('about');
      this.router.navigate(['/']);
    }, 100);
  }
}
