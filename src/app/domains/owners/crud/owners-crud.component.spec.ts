import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnersCrudComponent } from './owners-crud.component';
import { OwnerService } from '../owner.service';

type OwnerServiceSpy = {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('OwnersCrudComponent', () => {
  let fixture: ComponentFixture<OwnersCrudComponent>;
  let component: OwnersCrudComponent;
  let serviceSpy: OwnerServiceSpy;

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OwnersCrudComponent],
      providers: [{ provide: OwnerService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnersCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads owners', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('adds an owner on create', () => {
    const created = { id: 1, name: 'Ada', email: 'ada@example.com' };
    serviceSpy.create.mockReturnValue(of(created));

    component.draft.name = 'Ada';
    component.draft.email = 'ada@example.com';
    component.create();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(component.owners).toEqual([created]);
  });

  it('updates an owner', () => {
    const updated = { id: 1, name: 'Updated', email: 'u@example.com' };
    serviceSpy.update.mockReturnValue(of(updated));
    component.owners = [{ id: 1, name: 'Old', email: 'old@example.com' }];

    component.startEdit(component.owners[0]);
    component.editDraft.name = 'Updated';
    component.editDraft.email = 'u@example.com';
    component.update();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      name: 'Updated',
      email: 'u@example.com'
    });
    expect(component.owners[0]).toEqual(updated);
  });

  it('removes an owner on delete', () => {
    serviceSpy.delete.mockReturnValue(of(void 0));
    component.owners = [
      { id: 1, name: 'One', email: '1@example.com' },
      { id: 2, name: 'Two', email: '2@example.com' }
    ];

    component.delete(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.owners).toEqual([
      { id: 2, name: 'Two', email: '2@example.com' }
    ]);
  });
});
