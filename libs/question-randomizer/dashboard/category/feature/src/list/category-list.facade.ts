import { inject, Injectable } from '@angular/core';
import {
  CategoryListService,
  CategoryListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { PageEvent, SortDefinition } from '@my-nx-monorepo/design-system-ui';

@Injectable()
export class CategoryListFacade {
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly categoryListService = inject(CategoryListService);
  public sort = this.categoryListStore.sort;
  public page = this.categoryListStore.page;
  public searchText = this.categoryListStore.searchText;
  public filteredCount = this.categoryListStore.filteredCount;
  public categories = this.categoryListStore.displayCategories;

  public createCategory(createdCategory: Category) {
    this.categoryListService.createCategory(createdCategory);
  }

  public updateCategory(updatedCategory: Category) {
    this.categoryListService.updateCategory(updatedCategory);
  }

  public deleteCategory(categoryId: string) {
    this.categoryListService.deleteCategory(categoryId);
  }

  public setSearchText(searchText: string) {
    this.categoryListStore.setSearchText(searchText);
  }

  public setSort(sort: SortDefinition<Category>) {
    this.categoryListStore.setSort(sort);
  }

  public setPage(page: PageEvent) {
    this.categoryListStore.setPage({
      index: page.pageIndex,
      size: page.pageSize,
    });
  }
}
