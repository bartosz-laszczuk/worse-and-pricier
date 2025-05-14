import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IColumn, PageParameters, SortDefinition } from './table.models';
import { ColumnDirective } from './column-directive/column.directive';
import { TableService } from './table.service';
import { SortableHeaderComponent } from './sortable-header/sortable-header.component';
import { PageEvent, PaginatorComponent } from '../paginator';

@Component({
  selector: 'lib-table',
  imports: [CommonModule, SortableHeaderComponent, PaginatorComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  providers: [TableService],
})
export class TableComponent<T> implements AfterViewInit {
  @Input() set data(value: T[]) {
    this.dataSource = value;
  }
  @Input() columns: IColumn[] = [];
  @Input() title = '';
  @Input() sortDefinition?: SortDefinition<T>;
  @Input() trackBy = (index: number, item: T) => item;
  @Input() truncateHeaders = false;
  @Input() pageParameters: PageParameters = { index: 0, size: 10 };
  @Input() cellTextWrap = false;
  @Input() totalCount = 0;

  @Output() sort = new EventEmitter<SortDefinition<T>>();
  @Output() menuCloseEv: EventEmitter<string> = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() page = new EventEmitter<PageEvent>();

  @ContentChildren(ColumnDirective) columnTemps: QueryList<ColumnDirective> =
    new QueryList<ColumnDirective>();

  dataSource: T[] = [];
  columnTemplates: Record<string, ColumnDirective> = {};
  filterTemplates: Record<string, ColumnDirective> = {};

  get displayedColumns(): string[] {
    return [...this.columns.map((item: IColumn) => item.propertyName)];
  }
  constructor(
    private tableService: TableService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    const { columns, filters } = this.tableService.getTemplates(
      this.columnTemps
    );
    this.columnTemplates = columns;
    this.filterTemplates = filters;
    this.cdr.detectChanges();
  }

  onSort(sortDefinition: SortDefinition<T>): void {
    this.sort.emit(sortDefinition);
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }
}
