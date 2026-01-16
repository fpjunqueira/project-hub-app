import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AddressesFormComponent } from './addresses-form.component';
import { AddressService } from '../service/address.service';

type AddressServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    snapshot: { paramMap: { get: () => routeId } }
  } as unknown as ActivatedRoute;

  const serviceSpy: AddressServiceSpy = {
    get: vi.fn().mockReturnValue(
      of({ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' })
    ),
    create: vi.fn().mockReturnValue(
      of({ id: 2, street: 'New', city: 'B', state: 'TX', number: '2', zipCode: '1' })
    ),
    update: vi.fn().mockReturnValue(
      of({ id: 1, street: 'Updated', city: 'C', state: 'TX', number: '3', zipCode: '2' })
    )
  };

  await TestBed.configureTestingModule({
    imports: [AddressesFormComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: AddressService, useValue: serviceSpy }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(AddressesFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const router = TestBed.inject(Router);
  const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { fixture, component, serviceSpy, navigateSpy };
};

describe('AddressesFormComponent', () => {
  it('loads address when route has id', async () => {
    const { serviceSpy } = await setup('1');
    expect(serviceSpy.get).toHaveBeenCalledWith(1);
  });

  it('creates an address when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft = {
      street: 'Main',
      city: 'A',
      state: 'TX',
      number: '1',
      zipCode: '0'
    };
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/addresses']);
  });

  it('updates an address when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft = {
      id: 1,
      street: 'Updated',
      city: 'C',
      state: 'TX',
      number: '3',
      zipCode: '2'
    };
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      street: 'Updated',
      city: 'C',
      state: 'TX',
      number: '3',
      zipCode: '2'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/addresses']);
  });
});
