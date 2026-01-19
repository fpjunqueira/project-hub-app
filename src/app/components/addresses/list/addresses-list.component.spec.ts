import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AddressesListComponent } from './addresses-list.component';
import { AddressService } from '../service/address.service';

type AddressServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const buildPage = (content: Array<{ id?: number; street: string; city: string; state: string; number: string; zipCode: string }>) => ({
  content,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  size: 10,
  number: 0
});

describe('AddressesListComponent', () => {
  let fixture: ComponentFixture<AddressesListComponent>;
  let component: AddressesListComponent;
  let serviceSpy: AddressServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of(buildPage([]))),
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
    expect(serviceSpy.list).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no addresses', () => {
    component.addresses.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-empty')?.textContent).toContain('No addresses yet.');
  });

  it('renders table rows and pagination when addresses exist', () => {
    component.addresses.set([
      { id: 1, street: 'Main', city: 'Austin', state: 'TX', number: '10', zipCode: '78701' }
    ]);
    component.pageIndex.set(0);
    component.totalPages.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Page 1 of 2');
  });

  it('handles array responses on refresh', () => {
    serviceSpy.list.mockReturnValueOnce(
      of([{ id: 3, street: 'Oak', city: 'C', state: 'TX', number: '3', zipCode: '0' }])
    );

    component.refresh();

    expect(component.addresses().length).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('sets error when refresh fails', () => {
    serviceSpy.list.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.refresh();

    expect(component.error()).toBe('Failed to load addresses.');
  });

  it('skips delete when id is undefined', () => {
    component.delete();
    expect(serviceSpy.delete).not.toHaveBeenCalled();
  });

  it('moves between pages when available', () => {
    component.pageIndex.set(1);
    component.totalPages.set(3);

    component.previousPage();
    component.nextPage();

    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('ignores invalid page size values', () => {
    component.pageSize.set(10);

    component.updatePageSize('invalid');
    component.updatePageSize(-1);

    expect(component.pageSize()).toBe(10);
  });

  it('updates page size when value changes', () => {
    component.pageSize.set(10);

    component.updatePageSize(50);

    expect(component.pageSize()).toBe(50);
    expect(serviceSpy.list).toHaveBeenCalled();
  });
});
