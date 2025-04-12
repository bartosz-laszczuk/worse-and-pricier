import { inject, Injectable } from '@angular/core';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { CategoryListStore } from '../store';
import { CategoryRepositoryService } from '../repositories';
import { QuestionListService } from './question-list.service';

@Injectable()
export class CategoryListService {
  private readonly userStore = inject(UserStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly categoryRepositoryService = inject(
    CategoryRepositoryService
  );
  private readonly questionListService = inject(QuestionListService);

  public async createCategory(createdCategory: Category) {
    const userId = this.userStore.uid()!;

    try {
      this.categoryListStore.startLoading();

      const categoryId = await this.categoryRepositoryService.createCategory(
        createdCategory,
        userId
      );

      const category: Category = {
        ...createdCategory,
        id: categoryId,
        userId,
      };

      this.categoryListStore.addCategoryToList(category);
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Category creation failed'
      );
    }
  }

  public async updateCategory(updatedCategory: Category) {
    this.categoryListStore.startLoading();

    try {
      await this.categoryRepositoryService.updateCategory(updatedCategory.id, {
        name: updatedCategory.name,
      });
      this.categoryListStore.updateCategoryInList(updatedCategory.id, {
        name: updatedCategory.name,
      });
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Category update failed'
      );
    }
  }

  public async deleteCategory(categoryId: string) {
    this.categoryListStore.startLoading();

    try {
      await this.categoryRepositoryService.deleteCategory(categoryId);
      await this.questionListService.deleteCategoryIdFromQuestions(categoryId);
      this.categoryListStore.deleteCategoryFromList(categoryId);
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Category deletion failed'
      );
    }
  }

  public async loadCategoryList(forceLoad = false) {
    if (!forceLoad && this.categoryListStore.entities() !== null) return;

    this.categoryListStore.startLoading();

    try {
      const categories = await this.categoryRepositoryService.getCategories(
        this.userStore.uid()!
      );

      this.categoryListStore.loadCategoryList(categories);
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Load category list failed'
      );
    }
  }
}
