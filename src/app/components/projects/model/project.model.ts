import { Address } from '../../addresses/model/address.model';
import { FileRecord } from '../../files/model/file.model';
import { Owner } from '../../owners/model/owner.model';

export interface Project {
  id?: number;
  projectName: string;
  address?: Address | null;
  owners?: Owner[];
  files?: FileRecord[];
}
