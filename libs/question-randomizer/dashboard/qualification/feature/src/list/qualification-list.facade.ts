import { computed, inject, Injectable } from '@angular/core';
import {
  QualificationListStore,
  QualificationService,
} from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

@Injectable()
export class QualificationListFacade {
  private readonly userStore = inject(UserStore);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly qualificationService = inject(QualificationService);

  public qualifications = computed(
    () => this.qualificationListStore.entities() ?? []
  );

  public async createQualification(createdQualification: Qualification) {
    const userId = this.userStore.uid()!;
    const qualificationId = await this.qualificationService.createQualification(
      createdQualification,
      userId
    );
    const qualification: Qualification = {
      ...createdQualification,
      id: qualificationId,
      userId,
    };
    this.qualificationListStore.addQualificationToList(qualification);
  }

  public async updateQualification(updatedQualification: Qualification) {
    await this.qualificationService.updateQualification(
      updatedQualification.id,
      {
        name: updatedQualification.name,
      }
    );
    this.qualificationListStore.updateQualificationInList(
      updatedQualification.id,
      {
        name: updatedQualification.name,
      }
    );
  }

  public async deleteQualification(qualificationId: string) {
    await this.qualificationService.deleteQualification(qualificationId);
    this.qualificationListStore.deleteQualificationFromList(qualificationId);
  }

  public loadLists() {
    this.qualificationListStore.loadQualificationList();
  }
}
