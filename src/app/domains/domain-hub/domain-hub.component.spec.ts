import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AddressService } from '../addresses/address.service';
import { FileService } from '../files/file.service';
import { OwnerService } from '../owners/owner.service';
import { ProjectService } from '../projects/project.service';
import { DomainHubComponent } from './domain-hub.component';

describe('DomainHubComponent', () => {
  let fixture: ComponentFixture<DomainHubComponent>;

  beforeEach(async () => {
    const projectService = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    const ownerService = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    const addressService = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    const fileService = {
      list: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DomainHubComponent],
      providers: [
        { provide: ProjectService, useValue: projectService as unknown as ProjectService },
        { provide: OwnerService, useValue: ownerService as unknown as OwnerService },
        { provide: AddressService, useValue: addressService as unknown as AddressService },
        { provide: FileService, useValue: fileService as unknown as FileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainHubComponent);
    fixture.detectChanges();
  });

  it('creates the domain hub', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
