import { Routes } from '@angular/router';

import { DomainHubComponent } from './domains/domain-hub/domain-hub.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'domains' },
  { path: 'domains', component: DomainHubComponent }
];
