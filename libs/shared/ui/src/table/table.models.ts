export interface IColumn {
  displayName: string;
  propertyName: string;
  sortName?: string;
  sortable?: boolean;
  initSortDirection?: SortDirection;
  stickyStart?: boolean;
  stickyEnd?: boolean;
  width?: string;
}

export interface IComlumInputDirective {
  propertyName: string;
  type: string;
}

export const TypeOfTemplateEnum = {
  COLUMN: 'COLUMN',
  FILTER: 'FILTER',
};

export type SortDirection = 'asc' | 'desc' | '';

export interface IFilterSelected {
  column: string;
  filterSelected: boolean;
}

export interface SortDefinition<T> {
  field: keyof T;
  direction: SortDirection;
}
