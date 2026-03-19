import { Component } from '@angular/core';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';
import { GalleryShowcaseComponent } from '../../components/gallery-showcase/gallery-showcase';
import { ButtonsComponent } from '../../components/buttons/buttons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSectionComponent, GalleryShowcaseComponent, ButtonsComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
