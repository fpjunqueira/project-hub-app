import { Address } from '../../addresses/model/address.model';
import { Project } from '../../projects/model/project.model';

export interface Owner {
  id?: number;
  name: string;
  email: string;
  address?: Address | null;
  projects?: Project[];
}
