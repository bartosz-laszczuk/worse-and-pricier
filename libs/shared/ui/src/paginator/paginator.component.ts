import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  Input,
  output,
  signal,
} from '@angular/core';
import { PageEvent } from './_models/page-event.model';


@Component({
  selector: 'lib-shared-ui-paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  @Input() showFirstLastButtons = true;
  public totalCount = input.required<number>();
  public pageIndex = input.required<number>();
  public pageSize = input.required<number>();
  public pageSizeOptions = input.required<number[]>();
  public disabled = signal<boolean>(false);
  public page = output<PageEvent>();
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
