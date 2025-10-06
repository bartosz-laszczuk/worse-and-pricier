import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { EditCategoryComponent } from '@my-nx-monorepo/question-randomizer-dashboard-category-ui';
import { CategoryListFacade } from './category-list.facade';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  ButtonComponent,
  ColumnDirective,
  IColumn,
  InputTextComponent,
  PageEvent,
  SortDefinition,
  TableComponent,
} from '@my-nx-monorepo/design-system-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, take } from 'rxjs';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'lib-category-list',
  imports: [
    EditCategoryComponent,
    TableComponent,
    SvgIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
    ButtonComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CategoryListFacade],
})
export class CategoryListComponent {
  private readonly categoryListFacade = inject(CategoryListFacade);
  public categories = this.categoryListFacade.categories;
  public sort = this.categoryListFacade.sort;
  public page = this.categoryListFacade.page;
  public filteredCount = this.categoryListFacade.filteredCount;
  public categoryToEdit?: Category = undefined;
  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });

  public columns: IColumn[] = [
    {
      displayName: 'Name',
      propertyName: 'name',
      sortable: true,
    },
    { displayName: '', propertyName: 'edit', width: '3.5rem', center: true },
    { displayName: '', propertyName: 'delete', width: '3.5rem', center: true },
  ];

  public constructor() {
    toObservable(this.categoryListFacade.searchText)
      .pipe(take(1))
      .subscribe((value) =>
        this.searchTextControl.setValue(value, { emitEvent: false })
      );
    this.searchTextControl.valueChanges
      .pipe(debounceTime(100), takeUntilDestroyed())
      .subscribe((value) => this.categoryListFacade.setSearchText(value));
  }

  public onAdd() {
    this.categoryToEdit = { id: '', name: '', userId: '' };
  }

  public onClose(editedCategory?: Category) {
    if (editedCategory) {
      if (editedCategory.id)
        this.categoryListFacade.updateCategory(editedCategory);
      else this.categoryListFacade.createCategory(editedCategory);
    }
    this.categoryToEdit = undefined;
  }

  public onDelete(categoryId: string) {
    this.categoryListFacade.deleteCategory(categoryId);
  }

  public onSort(sort: SortDefinition<Category>): void {
    this.categoryListFacade.setSort(sort);
  }

  public onPage(page: PageEvent) {
    this.categoryListFacade.setPage(page);
  }
}
