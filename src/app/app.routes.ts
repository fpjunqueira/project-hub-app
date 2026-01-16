import { Routes } from '@angular/router';

import { AddressesCrudComponent } from './domains/addresses/addresses-crud.component';
import { FilesCrudComponent } from './domains/files/files-crud.component';
import { OwnersCrudComponent } from './domains/owners/owners-crud.component';
import { ProjectsCrudComponent } from './domains/projects/projects-crud.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'projects', component: ProjectsCrudComponent },
  { path: 'owners', component: OwnersCrudComponent },
  { path: 'addresses', component: AddressesCrudComponent },
  { path: 'files', component: FilesCrudComponent }
];
