import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders navigation links', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    const labels = Array.from(links).map((link) => link.textContent?.trim());

    expect(labels).toEqual([
      'Dashboard',
      'Tickets',
      'Projects',
      'Contract Registrations',
      'Claro Site',
      'TIM Site',
      'Vivo Site',
      'Billing',
      'Clients',
      'User Registrations',
      'Addresses',
      'Files'
    ]);
  });
});
