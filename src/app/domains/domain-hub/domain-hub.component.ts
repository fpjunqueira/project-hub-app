import { Component, ViewEncapsulation } from '@angular/core';

import { AddressesCrudComponent } from '../addresses/addresses-crud.component';
import { FilesCrudComponent } from '../files/files-crud.component';
import { OwnersCrudComponent } from '../owners/owners-crud.component';
import { ProjectsCrudComponent } from '../projects/projects-crud.component';

@Component({
  selector: 'app-domain-hub',
  standalone: true,
  imports: [
    AddressesCrudComponent,
    FilesCrudComponent,
    OwnersCrudComponent,
    ProjectsCrudComponent
  ],
  templateUrl: './domain-hub.component.html',
  styleUrl: './domain-hub.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DomainHubComponent {}
