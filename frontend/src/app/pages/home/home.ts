import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';
import { GalleryShowcaseComponent } from '../../components/gallery-showcase/gallery-showcase';
import { ButtonsComponent } from '../../components/buttons/buttons';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, HeroSectionComponent, GalleryShowcaseComponent, ButtonsComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
