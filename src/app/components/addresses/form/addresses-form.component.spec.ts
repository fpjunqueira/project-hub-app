import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AddressesFormComponent } from './addresses-form.component';
import { AddressService } from '../service/address.service';

type AddressServiceSpy = {
  get: ReturnType<typeof vi.fn>;
  getOwner: ReturnType<typeof vi.fn>;
  getProject: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const setup = async (routeId: string | null) => {
  const routeStub = {
    paramMap: of(convertToParamMap(routeId ? { id: routeId } : {}))
  } as unknown as ActivatedRoute;

  const serviceSpy: AddressServiceSpy = {
    get: vi.fn().mockReturnValue(
      of({ id: 1, street: 'Main', city: 'A', state: 'TX', number: '1', zipCode: '0' })
    ),
    getOwner: vi.fn().mockReturnValue(of(null)),
    getProject: vi.fn().mockReturnValue(of(null)),
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
    expect(serviceSpy.getOwner).toHaveBeenCalledWith(1);
    expect(serviceSpy.getProject).toHaveBeenCalledWith(1);
  });

  it('creates an address when no id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup(null);

    component.draft.set({
      street: 'Main',
      city: 'A',
      state: 'TX',
      number: '1',
      zipCode: '0'
    });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/addresses']);
  });

  it('updates an address when id is provided', async () => {
    const { component, serviceSpy, navigateSpy } = await setup('1');

    component.draft.set({
      id: 1,
      street: 'Updated',
      city: 'C',
      state: 'TX',
      number: '3',
      zipCode: '2'
    });
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

  it('does not submit when street is blank', async () => {
    const { component, serviceSpy } = await setup(null);

    component.draft.set({ street: '  ', city: 'A', state: 'TX', number: '1', zipCode: '0' });
    component.submit();

    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('renders edit state with empty relations', async () => {
    const { fixture } = await setup('1');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Edit Address');
    expect(compiled.textContent).toContain('No owner linked.');
    expect(compiled.textContent).toContain('No project linked.');
  });

  it('renders loading and error states for relations', async () => {
    const { component, fixture } = await setup('1');

    component.ownerLoading.set(true);
    component.projectLoading.set(true);
    component.relationsError.set('Failed to load related data.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Loading related data...');
    expect(compiled.textContent).toContain('Failed to load related data.');
  });

  it('sets relation error when relation fetch fails', async () => {
    const { component, serviceSpy } = await setup('1');
    serviceSpy.getOwner.mockReturnValueOnce(throwError(() => new Error('fail')));
    serviceSpy.getProject.mockReturnValueOnce(throwError(() => new Error('fail')));

    component['loadRelations'](1);

    expect(component.relationsError()).toBe('Failed to load related data.');
  });

  it('updates draft fields from input handlers', async () => {
    const { component } = await setup(null);

    component.updateStreet('Main');
    component.updateCity('City');
    component.updateState('TX');
    component.updateNumber('10');
    component.updateZipCode('00000');

    expect(component.draft()).toEqual({
      street: 'Main',
      city: 'City',
      state: 'TX',
      number: '10',
      zipCode: '00000'
    });
  });
});
