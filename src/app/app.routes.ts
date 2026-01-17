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
  { path: 'files', component: FilesListComponent, canActivate: [authGuard] }
];
