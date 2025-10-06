import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { IColumn } from '../table.models';
import { SortDefinition, SortDirection } from '@my-nx-monorepo/shared-util';

@Component({
  selector: 'lib-sortable-header',
  imports: [],
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableHeaderComponent<T> {
  public column = input.required<IColumn>();
  public sortDefinition = input<SortDefinition<T> | undefined>(undefined);
  public sort = output<SortDefinition<T>>();

  public sortByColumn(column: IColumn) {
    let sortDefinition = this.sortDefinition();
    sortDefinition = {
      field: column.propertyName as keyof T,
      direction: this.getNextSortDirection(sortDefinition?.direction),
    };
    this.sort.emit(sortDefinition);
  }

  private getNextSortDirection(direction?: SortDirection): SortDirection {
    if (!direction) return 'asc';
    if (direction === 'asc') return 'desc';
    return '';
  }
}
