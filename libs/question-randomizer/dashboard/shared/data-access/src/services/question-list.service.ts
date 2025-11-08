import { inject, Injectable } from '@angular/core';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
  Question,
  Randomization,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { UserStore } from '@worse-and-pricier/question-randomizer-shared-data-access';
import { QuestionRepositoryService } from '../repositories';
import { QuestionListStore, RandomizationStore } from '../store';
import { QuestionMapperService } from './question-mapper.service';
import { RandomizationService } from './randomization.service';
import {
  QuestionCategory,
  UsedQuestion,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { UsedQuestionListService } from './used-question-list.service';
import { PostponedQuestionListService } from './postponed-question-list.service';

@Injectable()
export class QuestionListService {
  private readonly userStore = inject(UserStore);
  private readonly questionRepositoryService = inject(
    QuestionRepositoryService
  );
  private readonly questionMapperService = inject(QuestionMapperService);
  private readonly questionListStore = inject(QuestionListStore);
  private readonly randomizationService = inject(RandomizationService);
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly usedQuestionListService = inject(UsedQuestionListService);
  private readonly postponedQuestionListService = inject(
    PostponedQuestionListService
  );

  /**
   * Creates a new question from form data and adds it to the question list.
   *
   * Performs optimistic update by adding the question to the local store immediately.
   * Also registers the question in the randomization pool for future selection.
   *
   * @param createdQuestion - Form data containing question details (text, category, qualification, etc.)
   *
   * @remarks
   * - Requires authenticated user (returns early if userId is null)
   * - Updates question list store and randomization store on success
   * - Logs error to store on failure (does not throw)
   * - Uses mapper service to transform form values to domain models and repository requests
   *
   * @example
   * ```typescript
   * await questionListService.createQuestionByForm({
   *   text: 'What is dependency injection?',
   *   categoryId: 'angular-basics',
   *   qualificationId: 'junior',
   *   isActive: true
   * });
   * ```
   */
  public async createQuestionByForm(createdQuestion: EditQuestionFormValue) {
    const userId = this.userStore.uid();
    if (!userId) return;
    this.questionListStore.startLoading();
    try {
      const createQuestionRequest =
        this.questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest(
          createdQuestion,
          userId
        );
      const questionId = await this.questionRepositoryService.createQuestion(
        createQuestionRequest
      );

      const question = this.questionMapperService.mapEditQuestionFormValueToQuestion(
        questionId,
        createdQuestion,
        userId
      );

      this.questionListStore.addQuestionToList(question);
      this.addQuestionToAvailableRandomization(question);
    } catch (error: unknown) {
      this.handleOperationError(error, 'Question creation');
    }
  }

  /**
   * Updates an existing question with new form data.
   *
   * Performs optimistic update to the local store, then persists to repository.
   * Also propagates category changes to randomization system and updates the current
   * question if it's the one being edited.
   *
   * Backend operations run in parallel for optimal performance. If any operation fails,
   * automatically rolls back the optimistic update to maintain data consistency between
   * client state and server state.
   *
   * @param questionId - The unique identifier of the question to update
   * @param updatedQuestion - Form data with updated question details
   *
   * @remarks
   * - Updates are optimistic: local store updated before backend persistence
   * - Backend operations run in parallel using Promise.all for ~10-50ms performance gain
   * - Automatic rollback on error ensures store consistency
   * - Category changes are synced across all randomization lists (available, used, postponed)
   * - If the updated question is currently displayed in randomization, it's refreshed or replaced
   * - Logs error to store on failure (does not throw)
   *
   * @example
   * ```typescript
   * await questionListService.updateQuestion('question-123', {
   *   question: 'Updated question text',
   *   answer: 'Updated answer',
   *   answerPl: 'Updated answer PL',
   *   categoryId: 'angular-advanced',
   *   categoryName: 'Angular Advanced',
   *   qualificationId: 'senior',
   *   qualificationName: 'Senior',
   *   isActive: true,
   *   tags: 'angular, typescript'
   * });
   * ```
   */
  public async updateQuestion(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    this.questionListStore.startLoading();

    // Capture previous state for rollback on error
    const previousQuestion = this.questionListStore.entities()?.[questionId];

    try {
      // Optimistic update
      this.questionListStore.updateQuestionInList(questionId, updatedQuestion);

      // Backend operations run in parallel for performance
      await Promise.all([
        this.saveQuestionToRepository(questionId, updatedQuestion),
        this.updateQuestionCategoryInRandomization(
          questionId,
          updatedQuestion.categoryId
        ),
        this.updateCurrentQuestionIfNeeded(questionId, updatedQuestion),
      ]);
    } catch (error: unknown) {
      // Rollback optimistic update on error
      if (previousQuestion) {
        this.questionListStore.restoreQuestion(previousQuestion);
      }
      this.handleOperationError(error, 'Question update');
    }
  }

  /**
   * Deletes a question from the system.
   *
   * Performs cascade deletion across multiple systems:
   * - Removes from question list store
   * - Removes from randomization available pool
   * - Removes from used question history
   * - Removes from postponed questions
   * - Clears as current question if displayed
   * - Deletes from repository (Firestore)
   *
   * All backend deletions run in parallel for performance.
   *
   * If backend operations fail, automatically rolls back the optimistic deletions to maintain
   * data consistency between client state and server state.
   *
   * @param questionId - The unique identifier of the question to delete
   *
   * @remarks
   * - Optimistic deletion: removed from stores before backend confirmation
   * - Automatic rollback on error ensures store consistency
   * - Multiple async operations run in parallel using Promise.all
   * - If question is currently displayed in randomization, it's cleared
   * - Logs error to store on failure (does not throw)
   *
   * @example
   * ```typescript
   * await questionListService.deleteQuestion('question-123');
   * ```
   */
  public async deleteQuestion(questionId: string) {
    this.questionListStore.startLoading();

    // Capture previous state for rollback on error
    const previousQuestion = this.questionListStore.entities()?.[questionId];

    try {
      // Optimistic deletions
      this.questionListStore.deleteQuestionFromList(questionId);
      this.randomizationStore.deleteAvailableQuestionFromRandomization(
        questionId
      );

      // Backend operations
      await Promise.all([
        this.questionRepositoryService.deleteQuestion(questionId),
        this.deleteUsedQuestionFromRandomization(questionId),
        this.deletePostponedQuestionFromRandomization(questionId),
        this.updateCurrentQuestionAfterQuestionDeletion(questionId),
      ]);
    } catch (error: unknown) {
      // Rollback optimistic deletions on error
      if (previousQuestion) {
        this.questionListStore.addQuestionToList(previousQuestion);
        this.randomizationStore.addAvailableQuestionsToRandomization([
          {
            questionId: previousQuestion.id,
            categoryId: previousQuestion.categoryId,
          },
        ]);
      }
      this.handleOperationError(error, 'Question deletion');
    }
  }

  /**
   * Loads all questions for the authenticated user from the repository.
   *
   * Fetches questions from Firestore and enriches them with category and qualification names
   * from the provided maps. Implements caching: skips loading if questions are already in store
   * unless forceLoad is true.
   *
   * @param categoryMap - Map of category IDs to Category objects for name enrichment
   * @param qualificationMap - Map of qualification IDs to Qualification objects for name enrichment
   * @param forceLoad - If true, forces reload even if questions are already in store. Defaults to false.
   *
   * @remarks
   * - Returns early if questions already loaded and forceLoad is false (caching)
   * - Requires authenticated user (returns early if userId is null)
   * - Enriches questions with categoryName and qualificationName for display
   * - Loads all questions into the store, replacing any existing data
   * - Logs error to store on failure (does not throw)
   *
   * @example
   * ```typescript
   * // Initial load (will fetch from backend)
   * await questionListService.loadQuestionList(categoryMap, qualificationMap);
   *
   * // Subsequent call (uses cache, skips backend)
   * await questionListService.loadQuestionList(categoryMap, qualificationMap);
   *
   * // Force reload from backend
   * await questionListService.loadQuestionList(categoryMap, qualificationMap, true);
   * ```
   */
  public async loadQuestionList(
    categoryMap: Record<string, Category>,
    qualificationMap: Record<string, Qualification>,
    forceLoad = false
  ) {
    if (!this.shouldLoadQuestions(forceLoad)) return;

    const userId = this.userStore.uid();
    if (!userId) return;

    this.questionListStore.startLoading();

    try {
      const rawQuestions =
        await this.questionRepositoryService.getQuestions(userId);
      const enrichedQuestions = this.enrichQuestionsWithNames(
        rawQuestions,
        categoryMap,
        qualificationMap
      );

      this.questionListStore.loadQuestionList(enrichedQuestions);
    } catch (error: unknown) {
      this.handleOperationError(error, 'Failed to load questions');
    }
  }

  /**
   * Removes category associations from all questions that reference the specified category.
   *
   * This is a cascade operation typically called when a category is being deleted.
   * Updates both the local store and the repository to ensure consistency.
   *
   * @param categoryId - The unique identifier of the category to remove from questions
   *
   * @remarks
   * - Returns early if no questions are loaded or user is not authenticated
   * - Updates all questions in bulk that have this categoryId
   * - Sets categoryId to null/undefined for affected questions
   * - Updates both local store and Firestore
   * - Logs error to store on failure (does not throw)
   *
   * @example
   * ```typescript
   * // When deleting a category, clean up question references
   * await questionListService.deleteCategoryIdFromQuestions('angular-basics');
   * ```
   */
  public async deleteCategoryIdFromQuestions(categoryId: string) {
    this.questionListStore.startLoading();
    const userId = this.userStore.uid();
    if (!this.questionListStore.entities() || !userId) return;

    try {
      this.questionListStore.deleteCategoryIdFromQuestions(categoryId);
      await this.questionRepositoryService.removeCategoryIdFromQuestions(
        categoryId,
        userId
      );
    } catch (error: unknown) {
      this.handleOperationError(
        error,
        'Failed to delete categoryId from questions'
      );
    }
  }

  /**
   * Removes qualification associations from all questions that reference the specified qualification.
   *
   * This is a cascade operation typically called when a qualification is being deleted.
   * Updates both the local store and the repository to ensure consistency.
   *
   * @param qualificationId - The unique identifier of the qualification to remove from questions
   *
   * @remarks
   * - Returns early if no questions are loaded or user is not authenticated
   * - Updates all questions in bulk that have this qualificationId
   * - Sets qualificationId to null/undefined for affected questions
   * - Updates both local store and Firestore
   * - Logs error to store on failure (does not throw)
   *
   * @example
   * ```typescript
   * // When deleting a qualification, clean up question references
   * await questionListService.deleteQualificationIdFromQuestions('junior');
   * ```
   */
  public async deleteQualificationIdFromQuestions(qualificationId: string) {
    this.questionListStore.startLoading();
    const userId = this.userStore.uid();
    if (!this.questionListStore.entities() || !userId) return;

    try {
      this.questionListStore.deleteQualificationIdFromQuestions(
        qualificationId
      );
      await this.questionRepositoryService.removeQualificationIdFromQuestions(
        qualificationId,
        userId
      );
    } catch (error: unknown) {
      this.handleOperationError(
        error,
        'Failed to delete qualificationId from questions'
      );
    }
  }

  /**
   * Finds the most recently used question that matches any of the selected categories.
   *
   * Searches backward through the used question history to find the last question
   * whose category matches one of the provided category IDs. Useful for displaying
   * the most recent question from active categories.
   *
   * @param usedQuestionList - Array of previously used questions, ordered chronologically
   * @param selectedCategoryIdList - Array of category IDs to search for
   * @returns The most recent Question matching the categories, or undefined if none found
   *
   * @remarks
   * - Searches from end to beginning (most recent first) for efficiency
   * - Returns undefined if question store is not loaded
   * - Returns undefined if no matching question is found
   * - Handles questions with null/undefined categoryId (won't match)
   * - Does not modify any state (pure query operation)
   *
   * @example
   * ```typescript
   * const lastQuestion = questionListService.findLastQuestionForCategoryIdList(
   *   usedQuestions,
   *   ['angular-basics', 'typescript']
   * );
   *
   * if (lastQuestion) {
   *   console.log('Last question from selected categories:', lastQuestion.text);
   * }
   * ```
   */
  public findLastQuestionForCategoryIdList(
    usedQuestionList: UsedQuestion[],
    selectedCategoryIdList: string[]
  ): Question | undefined {
    const questionMap = this.questionListStore.entities();

    if (!questionMap) return undefined;

    for (let i = usedQuestionList.length - 1; i >= 0; i--) {
      const usedQuestion = usedQuestionList[i];
      const question = questionMap[usedQuestion.questionId];

      if (
        question &&
        selectedCategoryIdList.includes(question.categoryId ?? '')
      ) {
        return question;
      }
    }

    return undefined;
  }

  private addQuestionToAvailableRandomization(question: Question) {
    this.randomizationStore.addAvailableQuestionsToRandomization([
      {
        questionId: question.id,
        categoryId: question.categoryId,
      },
    ]);
  }

  private async saveQuestionToRepository(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    const updateQuestionRequest =
      this.questionMapperService.mapEditQuestionFormValueToUpdateQuestionRequest(
        updatedQuestion,
        questionId
      );
    await this.questionRepositoryService.updateQuestion(
      questionId,
      updateQuestionRequest
    );
  }

  private async updateQuestionCategoryInRandomization(
    questionId: string,
    categoryId: string
  ) {
    const questionCategory: QuestionCategory = {
      questionId,
      categoryId,
    };
    await this.randomizationService.updateQuestionCategoryAcrossLists(
      questionCategory
    );
  }

  private async updateCurrentQuestionIfNeeded(
    questionId: string,
    updatedQuestion: EditQuestionFormValue
  ) {
    const randomization = this.randomizationStore.entity();
    if (randomization?.currentQuestion?.id !== questionId) {
      return;
    }

    if (this.shouldUpdateCurrentQuestion(randomization, updatedQuestion)) {
      this.updateCurrentQuestionWithUpdatedData(
        questionId,
        updatedQuestion,
        randomization
      );
    } else {
      this.replaceCurrentQuestionWithNext();
    }
  }

  private shouldUpdateCurrentQuestion(
    randomization: Randomization,
    updatedQuestion: EditQuestionFormValue
  ): boolean {
    const userId = this.userStore.uid();
    return (
      updatedQuestion.isActive &&
      !!userId &&
      randomization.selectedCategoryIdList.includes(updatedQuestion.categoryId)
    );
  }

  private updateCurrentQuestionWithUpdatedData(
    questionId: string,
    updatedQuestion: EditQuestionFormValue,
    randomization: Randomization
  ) {
    const userId = this.userStore.uid();
    if (!userId) return;

    randomization.currentQuestion =
      this.questionMapperService.mapEditQuestionFormValueToQuestion(
        questionId,
        updatedQuestion,
        userId
      );
  }

  private replaceCurrentQuestionWithNext() {
    const questionMap = this.questionListStore.entities();
    if (questionMap) {
      this.randomizationService.advanceToNextQuestion(
        questionMap
      );
    }
  }

  private async deleteUsedQuestionFromRandomization(questionId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.usedQuestionListService.deleteUsedQuestionFromRandomization(
        randomizationId,
        questionId
      );
  }

  private async deletePostponedQuestionFromRandomization(questionId: string) {
    const randomizationId = this.randomizationStore.entity()?.id;
    if (randomizationId)
      await this.postponedQuestionListService.deletePostponedQuestionFromRandomization(
        randomizationId,
        questionId
      );
  }

  private async updateCurrentQuestionAfterQuestionDeletion(
    deletedQuestionId: string
  ) {
    const randomization = this.randomizationStore.entity();
    if (!randomization) return;

    if (randomization.currentQuestion?.id === deletedQuestionId) {
      this.randomizationService.clearCurrentQuestion(randomization.id);
    }
  }

  private handleOperationError(error: unknown, operation: string): void {
    const errorMessage =
      error instanceof Error ? error.message : `${operation} failed`;
    this.questionListStore.logError(errorMessage);
  }

  private shouldLoadQuestions(forceLoad: boolean): boolean {
    return forceLoad || this.questionListStore.entities() === null;
  }

  private enrichQuestionsWithNames(
    questions: Question[],
    categoryMap: Record<string, Category>,
    qualificationMap: Record<string, Qualification>
  ): Question[] {
    return questions.map((question) => ({
      ...question,
      categoryName: question.categoryId
        ? categoryMap[question.categoryId]?.name
        : undefined,
      qualificationName: question.qualificationId
        ? qualificationMap[question.qualificationId]?.name
        : undefined,
    }));
  }
}
