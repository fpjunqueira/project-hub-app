import { Address } from '../../addresses/model/address.model';
import { FileRecord } from '../../files/model/file.model';
import { Owner } from '../../owners/model/owner.model';

export interface Project {
  id?: number;
  projectName: string;
  projectType?: string;
  projectNumber?: string;
  purchaseOrder?: string;
  serviceOrder?: string;
  poNumber?: string;
  directClient?: string;
  directClientManager?: string;
  finalClient?: string;
  finalClientManager?: string;
  siteId?: string;
  addressId?: string;
  contractRegistration?: { id?: number } | null;
  address?: Address | null;
  owners?: Owner[];
  files?: FileRecord[];
}
