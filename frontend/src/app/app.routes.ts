import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '/home' }
];
