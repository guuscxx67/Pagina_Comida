import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(this.isDarkMode());
  public darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('app-theme');
    
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      this.applyTheme(isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    }
  }

  private isDarkMode(): boolean {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  public toggleDarkMode(): void {
    this.applyTheme(!this.darkModeSubject.value);
  }

  public setDarkMode(isDark: boolean): void {
    this.applyTheme(isDark);
  }

  public isDarkModeActive(): boolean {
    return this.darkModeSubject.value;
  }
}
