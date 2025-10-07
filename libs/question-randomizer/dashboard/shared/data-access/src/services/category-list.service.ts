import { inject, Injectable } from '@angular/core';
import { Category } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { UserStore } from '@worse-and-pricier/question-randomizer-shared-data-access';
import { CategoryListStore, RandomizationStore } from '../store';
import { CategoryRepositoryService } from '../repositories';
import { QuestionListService } from './question-list.service';
import { RandomizationService } from './randomization.service';
import { UsedQuestionListService } from './used-question-list.service';
import { PostponedQuestionListService } from './postponed-question-list.service';
import { SelectedCategoryListService } from './selected-category-list.service';

@Injectable()
export class CategoryListService {
  private readonly userStore = inject(UserStore);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly categoryRepositoryService = inject(
    CategoryRepositoryService
  );
  private readonly questionListService = inject(QuestionListService);
  private readonly randomizationService = inject(RandomizationService);
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly usedQuestionListService = inject(UsedQuestionListService);
  private readonly postponedQuestionListService = inject(
    PostponedQuestionListService
  );
  private readonly selectedCategoryListService = inject(
    SelectedCategoryListService
  );

  public async createCategory(createdCategory: Category) {
    const userId = this.userStore.uid();
    if (!userId) return;

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
      this.categoryListStore.updateCategoryInList(updatedCategory.id, {
        name: updatedCategory.name,
      });
      await this.categoryRepositoryService.updateCategory(updatedCategory.id, {
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
      this.categoryListStore.deleteCategoryFromList(categoryId);
      this.randomizationStore.resetAvailableQuestionsCategoryId(categoryId);
      await Promise.all([
        this.categoryRepositoryService.deleteCategory(categoryId),
        this.questionListService.deleteCategoryIdFromQuestions(categoryId),
        this.deleteSelectedCategoryFromRandomization(categoryId),
        this.resetUsedQuestionsCategoryId(categoryId),
        this.resetPostponedQuestionsCategoryId(categoryId),
        this.updateCurrentQuestionAfterCategoryDeletion(categoryId),
      ]);
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Category deletion failed'
      );
    }
  }

  public async loadCategoryList(forceLoad = false) {
    if (!forceLoad && this.categoryListStore.entities() !== null) return;
    const userId = this.userStore.uid();
    if (!userId) return;

    this.categoryListStore.startLoading();

    try {
      const categories = await this.categoryRepositoryService.getCategories(
        userId
      );

      this.categoryListStore.loadCategoryList(categories);
    } catch (error: any) {
      this.categoryListStore.logError(
        error.message || 'Load category list failed'
      );
    }
  }

  private async updateCurrentQuestionAfterCategoryDeletion(
    deletedCategoryId: string
  ) {
    const randomization = this.randomizationStore.entity();
    if (!randomization) return;

    if (randomization.currentQuestion?.categoryId === deletedCategoryId) {
      this.randomizationService.clearCurrentQuestion(randomization.id);
    }
  }

  private async deleteSelectedCategoryFromRandomization(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.selectedCategoryListService.deselectSelectedCategoryFromRandomization(
        randomizationId,
        categoryId
      );
  }

  private async resetUsedQuestionsCategoryId(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.usedQuestionListService.resetUsedQuestionsCategoryId(
        randomizationId,
        categoryId
      );
  }

  private async resetPostponedQuestionsCategoryId(categoryId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.postponedQuestionListService.resetPostponedQuestionsCategoryId(
        randomizationId,
        categoryId
      );
  }
}
