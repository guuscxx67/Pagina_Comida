import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';
import { ButtonsComponent } from '../../components/buttons/buttons';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, HeroSectionComponent, ButtonsComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {}
