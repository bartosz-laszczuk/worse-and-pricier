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

  /**
   * Creates a new category for the current user.
   *
   * Validates user authentication before creation. On success, adds the newly
   * created category to the local store with the generated category ID from Firestore.
   *
   * @param createdCategory - The category data to create (without id and userId)
   * @returns Promise<void> - Resolves when category is created and stored locally
   *
   * @throws Will log error to store if:
   * - User is not authenticated
   * - Category name is invalid (empty or too long)
   * - Firestore creation fails
   * - Network error occurs
   *
   * @example
   * ```typescript
   * await categoryListService.createCategory({
   *   name: 'Technical Questions',
   *   description: 'Questions about technical skills'
   * });
   * ```
   */
  public async createCategory(createdCategory: Category) {
    const userId = this.userStore.uid();
    if (!userId) return;

    if (!this.validateCategoryName(createdCategory.name)) {
      this.categoryListStore.logError(
        'Category name is required and must be between 1 and 100 characters'
      );
      return;
    }

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
    } catch (error: unknown) {
      this.handleOperationError(error, 'Category creation', {
        userId,
        categoryName: createdCategory.name,
      });
    }
  }

  /**
   * Updates an existing category's name in both Firestore and local store.
   *
   * Performs pessimistic update by syncing to Firestore first, then updating
   * local store only on success. This ensures consistency with createCategory behavior.
   *
   * @param updatedCategory - The category with updated properties (must include id)
   * @returns Promise<void> - Resolves when update is complete
   *
   * @throws Will log error to store if:
   * - Category name is invalid (empty or too long)
   * - Category ID does not exist
   * - Firestore update fails
   * - Network error occurs
   *
   * @example
   * ```typescript
   * await categoryListService.updateCategory({
   *   id: 'cat123',
   *   name: 'Updated Category Name',
   *   userId: 'user456'
   * });
   * ```
   */
  public async updateCategory(updatedCategory: Category) {
    if (!this.validateCategoryName(updatedCategory.name)) {
      this.categoryListStore.logError(
        'Category name is required and must be between 1 and 100 characters'
      );
      return;
    }

    this.categoryListStore.startLoading();

    try {
      await this.categoryRepositoryService.updateCategory(updatedCategory.id, {
        name: updatedCategory.name,
      });
      this.categoryListStore.updateCategoryInList(updatedCategory.id, {
        name: updatedCategory.name,
      });
    } catch (error: unknown) {
      this.handleOperationError(error, 'Category update', {
        categoryId: updatedCategory.id,
        categoryName: updatedCategory.name,
      });
    }
  }

  /**
   * Deletes a category and performs cleanup across all related data.
   *
   * Performs cascading deletion by:
   * 1. Removing category from local store
   * 2. Resetting available questions for this category in randomization
   * 3. Deleting category from Firestore
   * 4. Removing category ID from all associated questions
   * 5. Deselecting category from active randomization
   * 6. Resetting category ID in used questions list
   * 7. Resetting category ID in postponed questions list
   * 8. Clearing current question if it belongs to deleted category
   *
   * Operations 3-8 execute in parallel using Promise.all().
   *
   * @param categoryId - The ID of the category to delete
   * @returns Promise<void> - Resolves when deletion and cleanup complete
   *
   * @throws Will log error to store if any operation fails
   *
   * @example
   * ```typescript
   * await categoryListService.deleteCategory('cat123');
   * ```
   */
  public async deleteCategory(categoryId: string) {
    this.categoryListStore.startLoading();

    try {
      this.categoryListStore.deleteCategoryFromList(categoryId);
      this.randomizationStore.resetAvailableQuestionsCategoryId(categoryId);
      await Promise.all([
        this.categoryRepositoryService.deleteCategory(categoryId),
        this.questionListService.deleteCategoryIdFromQuestions(categoryId),
        this.deselectCategoryFromRandomization(categoryId),
        this.resetUsedQuestionsCategoryId(categoryId),
        this.resetPostponedQuestionsCategoryId(categoryId),
        this.clearCurrentQuestionIfInCategory(categoryId),
      ]);
    } catch (error: unknown) {
      this.handleOperationError(error, 'Category deletion', { categoryId });
    }
  }

  /**
   * Loads the category list for the current user from Firestore.
   *
   * Implements caching strategy: skips loading if categories already exist
   * in store unless skipCache is true. Requires user to be authenticated.
   *
   * @param skipCache - If true, bypasses cache and reloads from Firestore. Defaults to false.
   * @returns Promise<void> - Resolves when categories are loaded into store
   *
   * @throws Will log error to store if:
   * - User is not authenticated
   * - Firestore fetch fails
   * - Network error occurs
   *
   * @example
   * ```typescript
   * // Load with caching
   * await categoryListService.loadCategoryList();
   *
   * // Force reload from Firestore (skip cache)
   * await categoryListService.loadCategoryList(true);
   * ```
   */
  public async loadCategoryList(skipCache = false) {
    if (!skipCache && this.categoryListStore.entities() !== null) return;
    const userId = this.userStore.uid();
    if (!userId) return;

    this.categoryListStore.startLoading();

    try {
      const categories = await this.categoryRepositoryService.getCategories(
        userId
      );

      this.categoryListStore.loadCategoryList(categories);
    } catch (error: unknown) {
      this.handleOperationError(error, 'Load category list', { userId });
    }
  }

  private async clearCurrentQuestionIfInCategory(categoryId: string) {
    const randomization = this.randomizationStore.entity();
    if (!randomization) return;

    if (randomization.currentQuestion?.categoryId === categoryId) {
      this.randomizationService.clearCurrentQuestion(randomization.id);
    }
  }

  private async deselectCategoryFromRandomization(categoryId: string) {
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

  /**
   * Validates category name meets requirements.
   *
   * @param name - The category name to validate
   * @returns true if name is valid, false otherwise
   */
  private validateCategoryName(name: string | undefined): boolean {
    if (!name) return false;
    const trimmedName = name.trim();
    return trimmedName.length > 0 && trimmedName.length <= 100;
  }

  /**
   * Centralized error handler for category operations.
   *
   * Extracts error message from Error objects or uses fallback message,
   * and logs to the category list store with optional context.
   *
   * @param error - The error that occurred (Error object or unknown type)
   * @param operationName - Name of the operation that failed (e.g., "Category creation")
   * @param context - Optional context data to include in error message for debugging
   */
  private handleOperationError(
    error: unknown,
    operationName: string,
    context?: Record<string, unknown>
  ): void {
    const baseMessage =
      error instanceof Error ? error.message : `${operationName} failed`;

    const errorMessage = context
      ? `${baseMessage} (${JSON.stringify(context)})`
      : baseMessage;

    this.categoryListStore.logError(errorMessage);
  }
}
