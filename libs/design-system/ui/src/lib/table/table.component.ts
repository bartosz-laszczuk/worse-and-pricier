import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  effect,
  inject,
  input,
  output,
  QueryList,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IColumn, PageParameters, SortDefinition, PageEvent } from './table.models';
import { ColumnDirective } from './column-directive/column.directive';
import { TableService } from './table.service';
import { SortableHeaderComponent } from './sortable-header/sortable-header.component';
import { PaginatorComponent } from '../paginator';

/**
 * A feature-rich table component with sorting, pagination, and custom column templates.
 *
 * @example
 * ```html
 * <lib-table
 *   [data]="items"
 *   [columns]="columnDefinitions"
 *   [totalCount]="totalItems"
 *   [pageParameters]="{ index: 0, size: 10 }"
 *   (sort)="onSort($event)"
 *   (page)="onPageChange($event)"
 *   (rowClick)="onRowClick($event)">
 * </lib-table>
 * ```
 */
@Component({
  selector: 'lib-table',
  imports: [CommonModule, SortableHeaderComponent, PaginatorComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  providers: [TableService],
})
export class TableComponent<T> implements AfterViewInit {
  /** Table data array */
  public data = input<T[]>([]);
  /** Column definitions with display name, property name, and sortability */
  public columns = input<IColumn[]>([]);
  /** Optional table title */
  public title = input<string>('');
  /** Current sort state (field and direction) */
  public sortDefinition = input<SortDefinition<T> | undefined>();
  /** Custom track by function for rendering optimization */
  public trackBy = input<(index: number, item: T) => T>((index: number, item: T) => item);
  /** Whether to truncate long header text with ellipsis */
  public truncateHeaders = input<boolean>(false);
  /** Pagination parameters (current page index and size) */
  public pageParameters = input<PageParameters>({ index: 0, size: 10 });
  /** Whether to wrap cell text or truncate */
  public cellTextWrap = input<boolean>(false);
  /** Total count of items (for pagination) */
  public totalCount = input<number>(0);

  /** Emits when user changes sort (field or direction) */
  public sort = output<SortDefinition<T>>();
  /** Emits when menu is closed */
  public menuCloseEv = output<string>();
  /** Emits when user clicks a table row */
  public rowClick = output<T>();
  /** Emits when user changes page or page size */
  public page = output<PageEvent>();

  @ContentChildren(ColumnDirective) columnTemps: QueryList<ColumnDirective> =
    new QueryList<ColumnDirective>();

  private readonly tableService = inject(TableService);
  private readonly cdr = inject(ChangeDetectorRef);

  dataSource = signal<T[]>([]);
  columnTemplates: Record<string, ColumnDirective> = {};
  filterTemplates: Record<string, ColumnDirective> = {};

  constructor() {
    // React to data input changes
    effect(() => {
      this.dataSource.set(this.data());
    });
  }

  get displayedColumns(): string[] {
    return [...this.columns().map((item: IColumn) => item.propertyName)];
  }

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
