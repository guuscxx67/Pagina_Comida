import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ProfileComponent } from './profile';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    localStorage.setItem('usuario', JSON.stringify({
      id: 'test-user',
      nombre: 'Usuario Test',
      email: 'test@test.com',
      telefono: '5555555555',
      es_admin: false,
    }));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem('usuario');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
