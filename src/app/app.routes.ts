import { Routes } from '@angular/router';

import { AddressesFormComponent } from './components/addresses/form/addresses-form.component';
import { AddressesListComponent } from './components/addresses/list/addresses-list.component';
import { AddressesViewComponent } from './components/addresses/view/addresses-view.component';
import { FilesFormComponent } from './components/files/form/files-form.component';
import { FilesListComponent } from './components/files/list/files-list.component';
import { FilesViewComponent } from './components/files/view/files-view.component';
import { OwnersFormComponent } from './components/owners/form/owners-form.component';
import { OwnersListComponent } from './components/owners/list/owners-list.component';
import { OwnersViewComponent } from './components/owners/view/owners-view.component';
import { ProjectsFormComponent } from './components/projects/form/projects-form.component';
import { ProjectsListComponent } from './components/projects/list/projects-list.component';
import { ProjectsViewComponent } from './components/projects/view/projects-view.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'projects/new', component: ProjectsFormComponent },
  { path: 'projects/:id/edit', component: ProjectsFormComponent },
  { path: 'projects/:id/view', component: ProjectsViewComponent },
  { path: 'projects', component: ProjectsListComponent },
  { path: 'owners/new', component: OwnersFormComponent },
  { path: 'owners/:id/edit', component: OwnersFormComponent },
  { path: 'owners/:id/view', component: OwnersViewComponent },
  { path: 'owners', component: OwnersListComponent },
  { path: 'addresses/new', component: AddressesFormComponent },
  { path: 'addresses/:id/edit', component: AddressesFormComponent },
  { path: 'addresses/:id/view', component: AddressesViewComponent },
  { path: 'addresses', component: AddressesListComponent },
  { path: 'files/new', component: FilesFormComponent },
  { path: 'files/:id/edit', component: FilesFormComponent },
  { path: 'files/:id/view', component: FilesViewComponent },
  { path: 'files', component: FilesListComponent }
];
