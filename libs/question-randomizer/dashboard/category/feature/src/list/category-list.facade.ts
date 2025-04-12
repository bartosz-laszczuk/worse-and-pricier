import { computed, inject, Injectable } from '@angular/core';
import {
  CategoryListService,
  CategoryListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class CategoryListFacade {
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly categoryListService = inject(CategoryListService);

  public categoryList = computed(
    () => this.categoryListStore.categoryList() ?? []
  );

  public createCategory(createdCategory: Category) {
    this.categoryListService.createCategory(createdCategory);
  }

  public updateCategory(updatedCategory: Category) {
    this.categoryListService.updateCategory(updatedCategory);
  }

  public deleteCategory(categoryId: string) {
    this.categoryListService.deleteCategory(categoryId);
  }
}
