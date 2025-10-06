import { SortDirection } from '@my-nx-monorepo/shared-util';

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