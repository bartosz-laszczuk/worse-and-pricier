import { computed, inject, Injectable } from '@angular/core';
import {
  QualificationListService,
  QualificationListStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class QualificationListFacade {
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly qualificationListService = inject(QualificationListService);

  public qualificationList = computed(
    () => this.qualificationListStore.qualificationList() ?? []
  );

  public createQualification(createdQualification: Qualification) {
    this.qualificationListService.createQualification(createdQualification);
  }

  public async updateQualification(updatedQualification: Qualification) {
    this.qualificationListService.createQualification(updatedQualification);
  }

  public async deleteQualification(qualificationId: string) {
    this.qualificationListService.deleteQualification(qualificationId);
  }
}
