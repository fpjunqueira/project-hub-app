import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { OwnersListComponent } from './owners-list.component';
import { OwnerService } from '../service/owner.service';

type OwnerServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const buildPage = (content: Array<{ id?: number; name: string; email: string }>) => ({
  content,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  size: 10,
  number: 0
});

describe('OwnersListComponent', () => {
  let fixture: ComponentFixture<OwnersListComponent>;
  let component: OwnersListComponent;
  let serviceSpy: OwnerServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of(buildPage([]))),
      delete: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [OwnersListComponent],
      providers: [provideRouter([]), { provide: OwnerService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads owners on init', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('removes an owner on delete', () => {
    component.owners.set([
      { id: 1, name: 'One', email: 'one@example.com' },
      { id: 2, name: 'Two', email: 'two@example.com' }
    ]);

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(serviceSpy.list).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no owners', () => {
    component.owners.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-empty')?.textContent).toContain('No owners yet.');
  });

  it('renders table rows and pagination when owners exist', () => {
    component.owners.set([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    component.pageIndex.set(0);
    component.totalPages.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Page 1 of 2');
  });

  it('handles array responses on refresh', () => {
    serviceSpy.list.mockReturnValueOnce(
      of([{ id: 3, name: 'New', email: 'new@example.com' }])
    );

    component.refresh();

    expect(component.owners().length).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('sets error when refresh fails', () => {
    serviceSpy.list.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.refresh();

    expect(component.error()).toBe('Failed to load owners.');
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
