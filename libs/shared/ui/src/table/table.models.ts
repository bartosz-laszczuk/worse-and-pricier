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

export type SortDirection = 'asc' | 'desc' | '';

export interface SortDefinition<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface PageParameters {
  index: number;
  size: number;
}

export type Filters<T> = Partial<Record<keyof T, string>>;
