import { inject, Injectable } from '@angular/core';
import { RandomizationStore } from '../store';
import { SelectedCategoryListRepositoryService } from '../repositories';

@Injectable()
export class SelectedCategoryListService {
  private readonly randomizationStore = inject(RandomizationStore);
  private readonly selectedCategoryListRepositoryService = inject(
    SelectedCategoryListRepositoryService
  );

  public async addSelectedCategoryToRandomization(
    randomizationId: string,
    categoryId: string
  ) {
    this.randomizationStore.startLoading();

    try {
      this.randomizationStore.addSelectedCategoryIdToRandomization(categoryId);

      await this.selectedCategoryListRepositoryService.addSelectedCategoryToRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to add Category to Randomization.'
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

      await this.selectedCategoryListRepositoryService.deleteSelectedCategoryFromRandomization(
        randomizationId,
        categoryId
      );
    } catch (error: any) {
      this.randomizationStore.logError(
        error.message || 'Failed to delete Category from Randomization.'
      );
    }
  }
}
