import { ConfigurationSummaryDto } from './backend';

export interface ConfigurationSection {
  id: string;
  name: string;
  fields: ConfigurationField[];
}

export interface ConfigurationField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
  value?: string | string[];
}

export interface ConfigurationWithSections extends ConfigurationSummaryDto {
  sections: ConfigurationSection[];
}
