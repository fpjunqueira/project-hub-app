import { Routes } from '@angular/router';

import { AddressesFormComponent } from './domains/addresses/form/addresses-form.component';
import { AddressesListComponent } from './domains/addresses/list/addresses-list.component';
import { AddressesViewComponent } from './domains/addresses/view/addresses-view.component';
import { FilesFormComponent } from './domains/files/form/files-form.component';
import { FilesListComponent } from './domains/files/list/files-list.component';
import { FilesViewComponent } from './domains/files/view/files-view.component';
import { OwnersFormComponent } from './domains/owners/form/owners-form.component';
import { OwnersListComponent } from './domains/owners/list/owners-list.component';
import { OwnersViewComponent } from './domains/owners/view/owners-view.component';
import { ProjectsFormComponent } from './domains/projects/form/projects-form.component';
import { ProjectsListComponent } from './domains/projects/list/projects-list.component';
import { ProjectsViewComponent } from './domains/projects/view/projects-view.component';

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
