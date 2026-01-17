import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnersListComponent } from './owners-list.component';
import { OwnerService } from '../service/owner.service';

type OwnerServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('OwnersListComponent', () => {
  let fixture: ComponentFixture<OwnersListComponent>;
  let component: OwnersListComponent;
  let serviceSpy: OwnerServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
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
    component.owners = [
      { id: 1, name: 'One', email: 'one@example.com' },
      { id: 2, name: 'Two', email: 'two@example.com' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.owners).toEqual([
      { id: 2, name: 'Two', email: 'two@example.com' }
    ]);
  });
});
