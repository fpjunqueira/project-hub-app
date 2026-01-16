import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AddressesCrudComponent } from './addresses-crud.component';
import { AddressService } from '../address.service';

type AddressServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('AddressesCrudComponent', () => {
  let fixture: ComponentFixture<AddressesCrudComponent>;
  let component: AddressesCrudComponent;
  let serviceSpy: AddressServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AddressesCrudComponent],
      providers: [{ provide: AddressService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads addresses', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('adds an address on create', () => {
    const created = {
      id: 1,
      street: 'Main',
      city: 'Austin',
      state: 'TX',
      number: '1',
      zipCode: '78701'
    };
    serviceSpy.create.mockReturnValue(of(created));

    component.draft = { ...created };
    component.create();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(component.addresses).toEqual([created]);
  });

  it('updates an address', () => {
    const updated = {
      id: 1,
      street: 'Updated',
      city: 'A',
      state: 'TX',
      number: '2',
      zipCode: '78702'
    };
    serviceSpy.update.mockReturnValue(of(updated));
    component.addresses = [
      { id: 1, street: 'Old', city: 'A', state: 'TX', number: '1', zipCode: '0' }
    ];

    component.startEdit(component.addresses[0]);
    component.editDraft.street = 'Updated';
    component.editDraft.number = '2';
    component.editDraft.zipCode = '78702';
    component.update();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      ...updated,
      id: 1
    });
    expect(component.addresses[0]).toEqual(updated);
  });

  it('removes an address on delete', () => {
    serviceSpy.delete.mockReturnValue(of(void 0));
    component.addresses = [
      { id: 1, street: 'One', city: 'A', state: 'TX', number: '1', zipCode: '0' },
      { id: 2, street: 'Two', city: 'B', state: 'TX', number: '2', zipCode: '0' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.addresses).toEqual([
      { id: 2, street: 'Two', city: 'B', state: 'TX', number: '2', zipCode: '0' }
    ]);
  });
});
