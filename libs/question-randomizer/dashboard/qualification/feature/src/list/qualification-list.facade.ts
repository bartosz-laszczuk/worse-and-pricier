import { computed, inject, Injectable } from '@angular/core';
import {
  QualificationListService,
  QualificationListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { PageEvent, SortDefinition } from '@my-nx-monorepo/design-system-ui';

@Injectable()
export class QualificationListFacade {
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly qualificationListService = inject(QualificationListService);
  public sort = this.qualificationListStore.sort;
  public page = this.qualificationListStore.page;
  public searchText = this.qualificationListStore.searchText;
  public filteredCount = this.qualificationListStore.filteredCount;
  public qualifications = this.qualificationListStore.displayQualifications;

  public createQualification(createdQualification: Qualification) {
    this.qualificationListService.createQualification(createdQualification);
  }

  public async updateQualification(updatedQualification: Qualification) {
    this.qualificationListService.createQualification(updatedQualification);
  }

  public async deleteQualification(qualificationId: string) {
    this.qualificationListService.deleteQualification(qualificationId);
  }

  public setSearchText(searchText: string) {
    this.qualificationListStore.setSearchText(searchText);
  }

  public setSort(sort: SortDefinition<Qualification>) {
    this.qualificationListStore.setSort(sort);
  }

  public setPage(page: PageEvent) {
    this.qualificationListStore.setPage({
      index: page.pageIndex,
      size: page.pageSize,
    });
  }
}
