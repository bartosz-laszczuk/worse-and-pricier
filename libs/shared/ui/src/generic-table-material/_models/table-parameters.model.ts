import { FieldSearchParameter } from './filter-definitions.model';
import { PageParameters } from './page-parameters.model';
import { SortDefinition } from './sort-definition.model';

export class TableParameters<T> {
  page: PageParameters = { index: 0, size: 18 };
  sort: SortDefinition<T> | null = null;
  filters = new Map<keyof T, FieldSearchParameter>();

  constructor(init?: Partial<TableParameters<T>>) {
    Object.assign(this, init);
  }
}
