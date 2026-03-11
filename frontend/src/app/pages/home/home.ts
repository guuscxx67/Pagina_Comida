import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';
import { ButtonsComponent } from '../../components/buttons/buttons';
import { MenuPreviewComponent } from '../../components/menu-preview/menu-preview';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, HeroSectionComponent, ButtonsComponent, MenuPreviewComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
