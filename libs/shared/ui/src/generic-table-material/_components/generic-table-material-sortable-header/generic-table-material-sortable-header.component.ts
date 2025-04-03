import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IColumn } from '../../_models/column.model';
import { SortDefinition } from '../../_models/sort-definition.model';

@Component({
  selector:
    'my-projects-generic-table-material-sortable-header,[my-projects-generic-table-material-sortable-header]',
  templateUrl: './generic-table-material-sortable-header.component.html',
  styleUrls: ['./generic-table-material-sortable-header.component.scss'],
})
export class GenericTableMaterialSortableHeaderComponent<T> {
  @Input() public column: IColumn | undefined;
  @Input() public sortDefinition: SortDefinition<T> | null = null;
  @Output() public sort = new EventEmitter<IColumn>();

  public sortByColumn(column: IColumn) {
    this.sort.emit(column);
  }
}
