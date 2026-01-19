import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { App } from './app';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('App', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'login', component: DummyRouteComponent },
          { path: 'projects', component: DummyRouteComponent }
        ]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('toggles sidebar visibility based on route', async () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    await router.navigateByUrl('/login');
    expect(component.showSidebar()).toBe(false);

    await router.navigateByUrl('/projects');
    expect(component.showSidebar()).toBe(true);
  });
});
