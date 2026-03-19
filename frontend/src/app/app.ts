import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ModalComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  showLayout = true;

  private readonly noLayoutRoutes = ['/register', '/admin'];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLayout = !this.noLayoutRoutes.some(route => event.urlAfterRedirects.startsWith(route));
    });
  }
}
