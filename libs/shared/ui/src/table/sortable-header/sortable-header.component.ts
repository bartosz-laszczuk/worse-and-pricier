import {
  Component,
  EventEmitter,
  input,
  Input,
  output,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IColumn, SortDefinition } from '../table.models';

@Component({
  selector: 'lib-sortable-header',
  imports: [CommonModule],
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.scss',
})
export class SortableHeaderComponent<T> {
  // public column = input.required<IColumn>();
  // public sortDefinition = input<SortDefinition<T> | undefined>(undefined);
  // public sort = output<SortDefinition<T>>();
  @Input() public column: IColumn | undefined;
  @Input() public sortDefinition: SortDefinition<T> | null = null;
  @Output() public sort = new EventEmitter<IColumn>();

  public sortByColumn(column: IColumn) {
    this.sort.emit(column);
  }
}
