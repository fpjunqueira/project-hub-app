import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AddressesListComponent } from './addresses-list.component';
import { AddressService } from '../service/address.service';

type AddressServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('AddressesListComponent', () => {
  let fixture: ComponentFixture<AddressesListComponent>;
  let component: AddressesListComponent;
  let serviceSpy: AddressServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
      delete: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [AddressesListComponent],
      providers: [provideRouter([]), { provide: AddressService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads addresses on init', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('removes an address on delete', () => {
    component.addresses.set([
      { id: 1, street: 'One', city: 'A', state: 'TX', number: '1', zipCode: '0' },
      { id: 2, street: 'Two', city: 'B', state: 'TX', number: '2', zipCode: '0' }
    ]);

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.addresses()).toEqual([
      { id: 2, street: 'Two', city: 'B', state: 'TX', number: '2', zipCode: '0' }
    ]);
  });
});
