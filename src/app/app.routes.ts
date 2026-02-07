import { Routes } from '@angular/router';

import { AddressesFormComponent } from './components/addresses/form/addresses-form.component';
import { AddressesListComponent } from './components/addresses/list/addresses-list.component';
import { AddressesViewComponent } from './components/addresses/view/addresses-view.component';
import { FilesFormComponent } from './components/files/form/files-form.component';
import { FilesListComponent } from './components/files/list/files-list.component';
import { FilesViewComponent } from './components/files/view/files-view.component';
import { LoginComponent } from './components/login/login.component';
import { OwnersFormComponent } from './components/owners/form/owners-form.component';
import { OwnersListComponent } from './components/owners/list/owners-list.component';
import { OwnersViewComponent } from './components/owners/view/owners-view.component';
import { ProjectsFormComponent } from './components/projects/form/projects-form.component';
import { ProjectsListComponent } from './components/projects/list/projects-list.component';
import { ProjectsViewComponent } from './components/projects/view/projects-view.component';
import { TelecomFormComponent } from './components/telecom/form/telecom-form.component';
import { TelecomListComponent } from './components/telecom/list/telecom-list.component';
import { TelecomViewComponent } from './components/telecom/view/telecom-view.component';
import { authGuard, loginGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'projects/new', component: ProjectsFormComponent, canActivate: [authGuard] },
  { path: 'projects/:id/edit', component: ProjectsFormComponent, canActivate: [authGuard] },
  { path: 'projects/:id/view', component: ProjectsViewComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsListComponent, canActivate: [authGuard] },
  { path: 'owners/new', component: OwnersFormComponent, canActivate: [authGuard] },
  { path: 'owners/:id/edit', component: OwnersFormComponent, canActivate: [authGuard] },
  { path: 'owners/:id/view', component: OwnersViewComponent, canActivate: [authGuard] },
  { path: 'owners', component: OwnersListComponent, canActivate: [authGuard] },
  { path: 'addresses/new', component: AddressesFormComponent, canActivate: [authGuard] },
  { path: 'addresses/:id/edit', component: AddressesFormComponent, canActivate: [authGuard] },
  { path: 'addresses/:id/view', component: AddressesViewComponent, canActivate: [authGuard] },
  { path: 'addresses', component: AddressesListComponent, canActivate: [authGuard] },
  { path: 'files/new', component: FilesFormComponent, canActivate: [authGuard] },
  { path: 'files/:id/edit', component: FilesFormComponent, canActivate: [authGuard] },
  { path: 'files/:id/view', component: FilesViewComponent, canActivate: [authGuard] },
  { path: 'files', component: FilesListComponent, canActivate: [authGuard] },
  { path: 'documentations/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'documentations' } },
  { path: 'documentations/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'documentations' } },
  { path: 'documentations/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'documentations' } },
  { path: 'documentations', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'documentations' } },
  { path: 'billings/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'billings' } },
  { path: 'billings/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'billings' } },
  { path: 'billings/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'billings' } },
  { path: 'billings', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'billings' } },
  { path: 'vehicle-registration-infos/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'vehicleRegistrationInfos' } },
  { path: 'vehicle-registration-infos/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'vehicleRegistrationInfos' } },
  { path: 'vehicle-registration-infos/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'vehicleRegistrationInfos' } },
  { path: 'vehicle-registration-infos', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'vehicleRegistrationInfos' } },
  { path: 'user-registrations/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'userRegistrations' } },
  { path: 'user-registrations/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'userRegistrations' } },
  { path: 'user-registrations/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'userRegistrations' } },
  { path: 'user-registrations', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'userRegistrations' } },
  { path: 'claro-sites/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'claroSites' } },
  { path: 'claro-sites/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'claroSites' } },
  { path: 'claro-sites/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'claroSites' } },
  { path: 'claro-sites', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'claroSites' } },
  { path: 'tim-sites/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'timSites' } },
  { path: 'tim-sites/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'timSites' } },
  { path: 'tim-sites/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'timSites' } },
  { path: 'tim-sites', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'timSites' } },
  { path: 'vivo-sites/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'vivoSites' } },
  { path: 'vivo-sites/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'vivoSites' } },
  { path: 'vivo-sites/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'vivoSites' } },
  { path: 'vivo-sites', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'vivoSites' } },
  { path: 'contract-registrations/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'contractRegistrations' } },
  { path: 'contract-registrations/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'contractRegistrations' } },
  { path: 'contract-registrations/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'contractRegistrations' } },
  { path: 'contract-registrations', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'contractRegistrations' } },
  { path: 'tickets/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'tickets' } },
  { path: 'tickets/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'tickets' } },
  { path: 'tickets/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'tickets' } },
  { path: 'tickets', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'tickets' } }
];
