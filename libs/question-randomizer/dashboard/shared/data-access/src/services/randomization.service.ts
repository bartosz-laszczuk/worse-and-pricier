import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import {
  Question,
  QuestionCategory,
  Randomization,
  RandomizationStatus,
  UNCATEGORIZED_ID,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import { RandomizationStore } from '../store';
import { PostponedQuestionListRepositoryService } from '../repositories/postponed-question-list-repository.service';
import { GetRandomizationResponse } from '../models';

@Injectable()
export class RandomizationService {

  private readonly randomizationStore = inject(RandomizationStore);
  private readonly randomizationRepositoryService = inject(
    RandomizationRepositoryService
  );
  private readonly randomizationMapperService = inject(
    RandomizationMapperService
  );
  private readonly selectedCategoryListRepositoryService = inject(
    SelectedCategoryListRepositoryService
  );
  private readonly usedQuestionListRepositoryService = inject(
    UsedQuestionListRepositoryService
  );
  private readonly postponedQuestionListRepositoryService = inject(
    PostponedQuestionListRepositoryService
  );

  /**
   * Loads randomization state for a user from the repository.
   *
   * @param userId - The user ID to load randomization for
   * @param questionMap - Dictionary of all available questions by ID
   * @param forceLoad - If true, bypasses cache and reloads from repository
   * @returns Promise that resolves when randomization is loaded
   *
   * @example
   * ```typescript
   * // Load randomization with caching (skips if already loaded)
   * await randomizationService.loadRandomization('user123', questionMaptionary);
   *
   * // Force reload from repository
   * await randomizationService.loadRandomization('user123', questionMaptionary, true);
   * ```
   */
  public async loadRandomization(
    userId: string,
    questionMap: Record<string, Question>,
    forceLoad = false
  ): Promise<void> {
    if (this.shouldSkipLoading(forceLoad)) return;

    this.randomizationStore.startLoading();
    try {
      const response: GetRandomizationResponse | null =
        await this.randomizationRepositoryService.getRandomization(userId);

      const randomization = response
        ? await this.loadExistingRandomization(response, questionMap)
        : await this.initializeNewRandomization(userId, questionMap);

      this.randomizationStore.setRandomization(randomization);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to load Randomization.');
    }
  }

  /**
   * Updates the current question with the next available question based on randomization logic.
   *
   * @param questionMap - Dictionary of all available questions by ID
   * @returns Promise that resolves when the current question is updated
   */
  public async advanceToNextQuestion(
    questionMap: Record<string, Question>
  ): Promise<void> {
    try {
      const randomization = this.randomizationStore.entity();
      if (!randomization) return;

      const newCurrentQuestion = this.selectNextQuestion(
        randomization,
        questionMap
      );

      if (this.shouldSkipUpdate(randomization, newCurrentQuestion)) {
        return;
      }

      await this.updateCurrentQuestion(randomization, newCurrentQuestion);
    } catch (error: unknown) {
      this.handleError(
        error,
        'Failed to update current question with next question.'
      );
    }
  }

  /**
   * Updates the randomization state in both the store and repository.
   *
   * @param randomization - The randomization object to update
   * @returns Promise that resolves when the randomization is updated
   */
  public async updateRandomization(
    randomization: Randomization
  ): Promise<void> {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.setRandomization(randomization);
      await this.randomizationRepositoryService.updateRandomization(
        randomization
      );
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update randomization.');
    }
  }

  /**
   * Updates the category ID for questions in all question lists (postponed and used).
   *
   * @param newQuestionCategory - The question category with updated categoryId
   * @returns Promise that resolves when all question lists are updated
   */
  public async updateQuestionCategoryAcrossLists(
    newQuestionCategory: QuestionCategory
  ): Promise<void> {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.updateQuestionCategoryListsCategoryId(
        newQuestionCategory
      );
      await Promise.all([
        this.postponedQuestionListRepositoryService.updatePostponedQuestionCategoryId(
          newQuestionCategory
        ),
        this.usedQuestionListRepositoryService.updateUsedQuestionCategoryId(
          newQuestionCategory
        ),
      ]);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update question category.');
    }
  }

  /**
   * Sets a specific question as the current question in the randomization.
   *
   * @param question - The question to set as current
   * @returns Promise that resolves when the current question is set
   */
  public async setQuestionAsCurrentQuestion(question: Question): Promise<void> {
    this.randomizationStore.startLoading();

    try {
      const randomization = this.randomizationStore.entity();
      if (!randomization) return;

      const updatedRandomization = {
        ...randomization,
        currentQuestion: question,
      };
      this.randomizationStore.setRandomization(updatedRandomization);
      await this.randomizationRepositoryService.updateRandomization(
        updatedRandomization
      );
    } catch (error: unknown) {
      this.handleError(error, 'Failed to set question as current question.');
    }
  }

  /**
   * Clears the current question from the randomization.
   *
   * @param randomizationId - The ID of the randomization to clear the current question from
   * @returns Promise that resolves when the current question is cleared
   */
  public async clearCurrentQuestion(randomizationId: string): Promise<void> {
    this.randomizationStore.startLoading();
    try {
      this.randomizationStore.clearCurrentQuestion();
      await this.randomizationRepositoryService.clearCurrentQuestion(
        randomizationId
      );
    } catch (error: unknown) {
      this.handleError(error, 'Failed to clear current question.');
    }
  }

  /**
   * Finds the first question from postponed list that matches selected categories.
   *
   * @param postponedQuestionIdList - List of postponed question IDs
   * @param selectedCategoryIdList - List of selected category IDs
   * @param questionMap - Dictionary of all available questions by ID
   * @returns The first matching question or undefined if none found
   */
  private findFirstMatchingQuestion(
    postponedQuestionIdList: string[],
    selectedCategoryIdList: string[],
    questionMap: Record<string, Question>
  ): Question | undefined {
    for (const questionId of postponedQuestionIdList) {
      const question = questionMap[questionId];

      if (
        question &&
        selectedCategoryIdList.includes(
          question.categoryId ?? UNCATEGORIZED_ID
        )
      ) {
        return question;
      }
    }

    return undefined;
  }

  /**
   * Initializes a new randomization for a user.
   * Creates the randomization in the repository and builds the initial state object.
   *
   * @param userId - The user ID to create randomization for
   * @param questionMap - Dictionary of all available questions by ID
   * @returns Promise that resolves to the initialized randomization
   */
  private async initializeNewRandomization(
    userId: string,
    questionMap: Record<string, Question>
  ): Promise<Randomization> {
    const randomizationId =
      await this.randomizationRepositoryService.createRandomization(userId);

    return {
      id: randomizationId,
      showAnswer: false,
      status: RandomizationStatus.Ongoing,
      usedQuestionList: [],
      postponedQuestionList: [],
      selectedCategoryIdList: [],
      availableQuestionList: Object.values(questionMap).map((question) => ({
        questionId: question.id,
        categoryId: question.categoryId,
      })),
    };
  }

  /**
   * Determines if randomization loading should be skipped.
   *
   * @param forceLoad - Whether to force load regardless of cache
   * @returns True if loading should be skipped, false otherwise
   */
  private shouldSkipLoading(forceLoad: boolean): boolean {
    return !forceLoad && this.randomizationStore.entity() !== null;
  }

  /**
   * Loads an existing randomization from the repository response.
   *
   * @param response - The randomization response from the repository
   * @param questionMap - Dictionary of all available questions by ID
   * @returns Promise that resolves to the loaded randomization
   */
  private async loadExistingRandomization(
    response: GetRandomizationResponse,
    questionMap: Record<string, Question>
  ): Promise<Randomization> {
    const [usedQuestionList, postponedQuestionList, selectedCategoryIdList] =
      await this.fetchRandomizationData(response.id);

    const currentQuestion = this.resolveCurrentQuestion(
      response.currentQuestionId,
      questionMap
    );

    return this.randomizationMapperService.mapGetRandomizationResponseToRandomization(
      response,
      usedQuestionList,
      postponedQuestionList,
      selectedCategoryIdList,
      questionMap,
      currentQuestion
    );
  }

  /**
   * Fetches all randomization-related data from repositories in parallel.
   *
   * @param randomizationId - The randomization ID to fetch data for
   * @returns Promise that resolves to tuple of [usedQuestions, postponedQuestions, selectedCategories]
   */
  private async fetchRandomizationData(
    randomizationId: string
  ): Promise<[QuestionCategory[], QuestionCategory[], string[]]> {
    return Promise.all([
      this.usedQuestionListRepositoryService.getUsedQuestionIdListForRandomization(
        randomizationId
      ),
      this.postponedQuestionListRepositoryService.getPostponedQuestionIdListForRandomization(
        randomizationId
      ),
      this.selectedCategoryListRepositoryService.getSelectedCategoryIdListForRandomization(
        randomizationId
      ),
    ]);
  }

  /**
   * Resolves the current question from the question dictionary.
   *
   * @param currentQuestionId - The ID of the current question
   * @param questionMap - Dictionary of all available questions by ID
   * @returns The current question or undefined if not found
   */
  private resolveCurrentQuestion(
    currentQuestionId: string | undefined,
    questionMap: Record<string, Question>
  ): Question | undefined {
    return currentQuestionId && questionMap[currentQuestionId]
      ? questionMap[currentQuestionId]
      : undefined;
  }

  /**
   * Selects the next question based on randomization logic.
   * Priority order: available questions (random) → postponed questions (first match) → clear current.
   *
   * @param randomization - The current randomization state
   * @param questionMap - Dictionary of all available questions by ID
   * @returns The next question or undefined if no questions available
   *
   * @example
   * ```typescript
   * // Internally used by advanceToNextQuestion
   * const nextQuestion = this.selectNextQuestion(randomization, questionMaptionary);
   * // Returns: random available question, or first postponed, or undefined
   * ```
   */
  private selectNextQuestion(
    randomization: Randomization,
    questionMap: Record<string, Question>
  ): Question | undefined {
    const availableQuestions = this.getActiveQuestions(
      this.randomizationStore.filteredAvailableQuestionList(),
      questionMap
    );

    if (availableQuestions.length > 0) {
      return this.selectRandomQuestion(availableQuestions, questionMap);
    }

    const postponedQuestions = this.getActiveQuestions(
      this.randomizationStore.filteredPostponedQuestionList(),
      questionMap
    );

    if (postponedQuestions.length > 0) {
      return this.findFirstMatchingQuestion(
        postponedQuestions.map((pq) => pq.questionId),
        randomization.selectedCategoryIdList,
        questionMap
      );
    }

    // No questions available - clear current question by returning undefined
    return undefined;
  }

  /**
   * Filters question list to only include active questions.
   *
   * @param questionList - List of question categories to filter
   * @param questionMap - Dictionary of all available questions by ID
   * @returns Filtered list containing only active questions
   */
  private getActiveQuestions(
    questionList: QuestionCategory[],
    questionMap: Record<string, Question>
  ): QuestionCategory[] {
    return questionList.filter((qc) => questionMap[qc.questionId]?.isActive);
  }

  /**
   * Generates a random index for array access.
   * Protected to allow spying in tests for deterministic behavior.
   *
   * @param max - Maximum value (exclusive)
   * @returns Random index between 0 and max-1
   */
  protected getRandomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }

  /**
   * Selects a random question from the given list.
   *
   * @param questionList - List of question categories to select from
   * @param questionMap - Dictionary of all available questions by ID
   * @returns A randomly selected question
   */
  private selectRandomQuestion(
    questionList: QuestionCategory[],
    questionMap: Record<string, Question>
  ): Question {
    const randomIndex = this.getRandomIndex(questionList.length);
    return questionMap[questionList[randomIndex].questionId];
  }

  /**
   * Determines if the current question update should be skipped.
   *
   * @param randomization - The current randomization state
   * @param newCurrentQuestion - The new current question to set
   * @returns True if update should be skipped, false otherwise
   */
  private shouldSkipUpdate(
    randomization: Randomization,
    newCurrentQuestion: Question | undefined
  ): boolean {
    return !randomization.currentQuestion && !newCurrentQuestion;
  }

  /**
   * Updates the current question in the store and repository.
   *
   * @param randomization - The randomization to update
   * @param newCurrentQuestion - The new current question to set
   * @returns Promise that resolves when update is complete
   */
  private async updateCurrentQuestion(
    randomization: Randomization,
    newCurrentQuestion: Question | undefined
  ): Promise<void> {
    const updatedRandomization = {
      ...randomization,
      showAnswer: false,
      currentQuestion: newCurrentQuestion,
    };

    this.randomizationStore.startLoading();
    this.randomizationStore.setCurrentQuestion(newCurrentQuestion);
    await this.randomizationRepositoryService.updateRandomization(
      updatedRandomization
    );
  }

  /**
   * Handles errors by logging them to the store with a consistent format.
   *
   * @param error - The error that occurred
   * @param defaultMessage - The default error message to use if error is not an Error instance
   */
  private handleError(error: unknown, defaultMessage: string): void {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;
    this.randomizationStore.logError(errorMessage);
  }
}
