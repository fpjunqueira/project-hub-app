import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

import { AddressService } from '../addresses/service/address.service';
import { DashboardComponent } from './dashboard.component';
import { OwnerService } from '../owners/service/owner.service';
import { ProjectService } from '../projects/service/project.service';
import { TelecomService } from '../telecom/service/telecom.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const projectService = { list: () => of({ content: [], totalElements: 10, totalPages: 1 }) };
    const ownerService = { list: () => of({ content: [], totalElements: 7, totalPages: 1 }) };
    const addressService = { list: () => of({ content: [], totalElements: 4, totalPages: 1 }) };
    const telecomService = {
      list: (url: string) => {
        let total = 2;
        if (url.includes('tickets')) total = 5;
        else if (url.includes('contract-registrations')) total = 3;
        return of({ content: [], totalElements: total, totalPages: 1 });
      }
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterModule.forRoot([])],
      providers: [
        { provide: ProjectService, useValue: projectService },
        { provide: TelecomService, useValue: telecomService },
        { provide: OwnerService, useValue: ownerService },
        { provide: AddressService, useValue: addressService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set all counts from services', () => {
    expect(component.projectsCount()).toBe(10);
    expect(component.ticketsCount()).toBe(5);
    expect(component.clientsCount()).toBe(7);
    expect(component.contractRegistrationsCount()).toBe(3);
    expect(component.addressesCount()).toBe(4);
    expect(component.billingsCount()).toBe(2);
  });
});
