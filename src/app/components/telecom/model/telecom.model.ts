export interface TelecomScreenField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  autoFill?: boolean;
  readOnly?: boolean;
  inputType?: 'text' | 'select';
  options?: Array<{ value: string; label: string }>;
  showInList?: boolean;
}

export interface TelecomScreenConfig {
  key: string;
  title: string;
  baseUrl: string;
  route: string;
  fields: TelecomScreenField[];
}

export type TelecomRecord = {
  id?: number;
  [key: string]: string | number | boolean | null | undefined | { id?: number } | Record<string, unknown>;
};
