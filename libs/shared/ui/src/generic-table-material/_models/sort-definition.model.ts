import { SortDirection } from './sort-direction.model';

export interface SortDefinition<T> {
  field: keyof T;
  direction: SortDirection;
}
