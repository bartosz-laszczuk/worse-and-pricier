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
