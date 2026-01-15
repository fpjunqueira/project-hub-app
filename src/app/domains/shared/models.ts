export interface Project {
  id?: number;
  projectName: string;
}

export interface Owner {
  id?: number;
  name: string;
  email: string;
}

export interface Address {
  id?: number;
  street: string;
  city: string;
  state: string;
  number: string;
  zipCode: string;
}

export interface FileRecord {
  id?: number;
  filename: string;
  path: string;
  projectId?: number | null;
}
