// Table-specific models
// Re-export shared table types from tokens library
export {
  SortDirection,
  SortDefinition,
  PageParameters,
  Filters,
} from '@worse-and-pricier/design-system-tokens';

import { SortDirection } from '@worse-and-pricier/design-system-tokens';

export interface IColumn {
  displayName: string;
  propertyName: string;
  sortName?: string;
  sortable?: boolean;
  initSortDirection?: SortDirection;
  stickyStart?: boolean;
  stickyEnd?: boolean;
  width?: string;
  center?: boolean;
}

export interface IComlumInputDirective {
  propertyName: string;
  type: string;
}

export const TypeOfTemplateEnum = {
  COLUMN: 'COLUMN',
  FILTER: 'FILTER',
};