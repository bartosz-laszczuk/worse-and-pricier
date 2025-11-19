import { inject, Injectable } from '@angular/core';
import { RandomizationStore } from '../store';
import { SelectedCategoryListRepository } from '../repositories';

@Injectable()
export class SelectedCategoryListService {
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly selectedCategoryListRepository = inject(
    SelectedCategoryListRepository
  );

  public async addSelectedCategoryToRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addSelectedCategoryIdToRandomization(categoryId);

      await this.selectedCategoryListRepository.addSelectedCategoryToRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to add Category to Randomization.'
      );
    }
  }

  public async deselectSelectedCategoryFromRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.deleteSelectedCategoryIdFromRandomization(
        categoryId
      );

      await this.selectedCategoryListRepository.deleteSelectedCategoryFromRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: unknown) {
      this.randomizationStore.logError(
        error instanceof Error ? error.message : 'Failed to delete Category from Randomization.'
      );
    }
  }
}
