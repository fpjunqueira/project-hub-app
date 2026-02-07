export interface TelecomScreenField {
  key: string;
  label: string;
  placeholder?: string;
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
  [key: string]: string | number | null | undefined;
};
