// Table-specific models
// Re-export shared table types
export * from '../models/table.models';

import { SortDirection } from '../models/table.models';

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