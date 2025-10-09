import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { PageEvent } from '@worse-and-pricier/design-system-tokens';

/**
 * Pagination control component for navigating through paginated data.
 *
 * @example
 * ```html
 * <lib-shared-ui-paginator
 *   [totalCount]="100"
 *   [pageIndex]="0"
 *   [pageSize]="10"
 *   [pageSizeOptions]="[5, 10, 25, 50]"
 *   (page)="onPageChange($event)">
 * </lib-shared-ui-paginator>
 * ```
 */
@Component({
  selector: 'lib-shared-ui-paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  /** Whether to show first/last page buttons */
  public showFirstLastButtons = input<boolean>(true);
  /** Total count of all items across all pages */
  public totalCount = input.required<number>();
  /** Current page index (zero-based) */
  public pageIndex = input.required<number>();
  /** Number of items per page */
  public pageSize = input.required<number>();
  /** Available page size options */
  public pageSizeOptions = input.required<number[]>();
  /** Whether pagination controls are disabled */
  public disabled = signal<boolean>(false);
  /** Emits when user navigates to a different page */
  public page = output<PageEvent>();
  /** Calculated number of total pages */
  public numberOfPages = 0;

  constructor() {
    effect(() => {
      const totalCount = this.totalCount();
      const pageSize = this.pageSize();
      if (totalCount && pageSize) {
        this.numberOfPages = Math.ceil(totalCount / pageSize);
      }
      if (totalCount === 0) {
        this.numberOfPages = 1;
      }
    });
  }

  onPage(newPageIndex: number) {
    this.page.emit({
      length: this.totalCount(),
      pageIndex: newPageIndex,
      pageSize: this.pageSize(),
    } as PageEvent);
  }
}
