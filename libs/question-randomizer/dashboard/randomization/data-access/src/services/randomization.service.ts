import { inject, Injectable } from '@angular/core';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { RandomizationStore } from '../store';
import { Question } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { RandomizationMapperService } from './randomization-mapper.service';
import {
  Randomization,
  RandomizationStatus,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

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

  public async loadRandomization(
    userId: string,
    questionDic: Record<string, Question>,
    forceLoad = false
  ) {
    if (!forceLoad && this.randomizationStore.entity() !== null) return;
    this.randomizationStore.startLoading();

    try {
      const response =
        await this.randomizationRepositoryService.getRandomization(userId);

      if (!response) {
        this.randomizationStore.patchRandomization(
          await this.getNewRandomization(userId)
        );
      } else {
        const usedQuestionIdList =
          await this.usedQuestionListRepositoryService.getUsedQuestionIdListForRandomization(
            response.id
          );
        const selectedCategoryIdList =
          await this.selectedCategoryListRepositoryService.getSelectedCategoryIdListForRandomiozation(
            response.id
          );

        let currentQuestion: Question | undefined = undefined;
        if (
          response.currentQuestionId &&
          questionDic[response.currentQuestionId]
        ) {
          currentQuestion = questionDic[response.currentQuestionId];
        }

        const randomization =
          this.randomizationMapperService.mapGetRandomizationResopnseToRandomization(
            response,
            usedQuestionIdList,
            selectedCategoryIdList,
            currentQuestion
          );

        this.randomizationStore.patchRandomization(randomization);
      }
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to load randomization.'
      );
    }
  }

  private async getNewRandomization(userId: string): Promise<Randomization> {
    const randomizationId =
      await this.randomizationRepositoryService.createRandomization(userId);

    return {
      id: randomizationId,
      isAnswerHidden: true,
      status: RandomizationStatus.Ongoing,
      usedQuestionIdList: [],
      selectedCategoryIdList: [],
    };
  }
}
