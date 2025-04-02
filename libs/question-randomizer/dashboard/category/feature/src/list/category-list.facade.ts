import { computed, inject, Injectable } from '@angular/core';
import {
  CategoryListStore,
  CategoryService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class CategoryListFacade {
  private readonly userStore = inject(UserStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly categoryService = inject(CategoryService);

  public categories = computed(() => this.categoryListStore.entities() ?? []);

  public async createCategory(createdCategory: Category) {
    const userId = this.userStore.uid()!;
    const categoryId = await this.categoryService.createCategory(
      createdCategory,
      userId
    );
    const category: Category = { ...createdCategory, id: categoryId, userId };
    this.categoryListStore.addCategoryToList(category);
  }

  public async updateCategory(updatedCategory: Category) {
    await this.categoryService.updateCategory(updatedCategory.id, {
      name: updatedCategory.name,
    });
    this.categoryListStore.updateCategoryInList(updatedCategory.id, {
      name: updatedCategory.name,
    });
  }

  public async deleteCategory(categoryId: string) {
    await this.categoryService.deleteCategory(categoryId);
    this.categoryListStore.deleteCategoryFromList(categoryId);
  }

  public loadLists() {
    this.categoryListStore.loadCategoryList();
  }
}
