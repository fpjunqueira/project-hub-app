import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AddressesViewComponent } from './addresses-view.component';
import { AddressService } from '../service/address.service';

type AddressServiceSpy = {
  get: ReturnType<typeof vi.fn>;
};

describe('AddressesViewComponent', () => {
  let fixture: ComponentFixture<AddressesViewComponent>;
  let component: AddressesViewComponent;
  let serviceSpy: AddressServiceSpy;

  beforeEach(async () => {
    const routeStub = {
      snapshot: { paramMap: { get: () => '1' } }
    } as unknown as ActivatedRoute;

    serviceSpy = {
      get: vi.fn().mockReturnValue(
        of({ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' })
      )
    };

    await TestBed.configureTestingModule({
      imports: [AddressesViewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: AddressService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads address details', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
  });
});
