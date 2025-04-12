import { inject, Injectable } from '@angular/core';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';
import { QualificationListStore } from '../store';
import { QualificationRepositoryService } from '../repositories';
import { QuestionListService } from './question-list.service';

@Injectable()
export class QualificationListService {
  private readonly userStore = inject(UserStore);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly qualificationRepositoryService = inject(
    QualificationRepositoryService
  );
  private readonly questionListService = inject(QuestionListService);

  public async createQualification(createdQualification: Qualification) {
    const userId = this.userStore.uid()!;

    try {
      this.qualificationListStore.startLoading();

      const qualificationId =
        await this.qualificationRepositoryService.createQualification(
          createdQualification,
          userId
        );

      const qualification: Qualification = {
        ...createdQualification,
        id: qualificationId,
        userId,
      };

      this.qualificationListStore.addQualificationToList(qualification);
    } catch (error: any) {
      this.qualificationListStore.logError(
        error.message || 'Qualification creation failed'
      );
    }
  }

  public async updateQualification(updatedQualification: Qualification) {
    this.qualificationListStore.startLoading();

    try {
      await this.qualificationRepositoryService.updateQualification(
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
    } catch (error: any) {
      this.qualificationListStore.logError(
        error.message || 'Qualification update failed'
      );
    }
  }

  public async deleteQualification(qualificationId: string) {
    this.qualificationListStore.startLoading();

    try {
      await this.qualificationRepositoryService.deleteQualification(
        qualificationId
      );
      await this.questionListService.deleteQualificationIdFromQuestions(
        qualificationId
      );
      this.qualificationListStore.deleteQualificationFromList(qualificationId);
    } catch (error: any) {
      this.qualificationListStore.logError(
        error.message || 'Qualification deletion failed'
      );
    }
  }

  public async loadQualificationList(forceLoad = false) {
    if (!forceLoad && this.qualificationListStore.entities() !== null) return;

    this.qualificationListStore.startLoading();

    try {
      const qualifications =
        await this.qualificationRepositoryService.getQualifications(
          this.userStore.uid()!
        );

      this.qualificationListStore.loadQualificationList(qualifications);
    } catch (error: any) {
      this.qualificationListStore.logError(
        error.message || 'Load qualification list failed'
      );
    }
  }
}
