import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnersViewComponent } from './owners-view.component';
import { OwnerService } from '../service/owner.service';

type OwnerServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getProjects: ReturnType<typeof vi.fn>;
  getAddress: ReturnType<typeof vi.fn>;
};

describe('OwnersViewComponent', () => {
  let fixture: ComponentFixture<OwnersViewComponent>;
  let component: OwnersViewComponent;
  let serviceSpy: OwnerServiceSpy;

  beforeEach(async () => {
    const routeStub = {
      paramMap: of(convertToParamMap({ id: '1' }))
    } as unknown as ActivatedRoute;

    serviceSpy = {
      get: vi.fn().mockReturnValue(of({ id: 1, name: 'Loaded', email: 'a@b.com' })),
      getProjects: vi.fn().mockReturnValue(of([])),
      getAddress: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [OwnersViewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: OwnerService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads owner details', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(serviceSpy.getProjects).toHaveBeenCalledWith(1);
    expect(serviceSpy.getAddress).toHaveBeenCalledWith(1);
  });
});
