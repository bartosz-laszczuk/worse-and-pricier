import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualificationListFacade } from './qualification-list.facade';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { EditQualificationComponent } from '@my-nx-monorepo/question-randomizer-dashboard-qualification-ui';

@Component({
  selector: 'lib-qualification-list',
  imports: [CommonModule, EditQualificationComponent],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QualificationListFacade],
})
export class QualificationListComponent {
  private readonly qualificationListFacade = inject(QualificationListFacade);
  public qualifications = this.qualificationListFacade.qualifications;
  public qualificationToEdit?: Qualification = undefined;

  public onAdd() {
    this.qualificationToEdit = { id: '', name: '', userId: '' };
  }

  public onClose(editedQualification?: Qualification) {
    if (editedQualification) {
      if (editedQualification.id)
        this.qualificationListFacade.updateQualification(editedQualification);
      else
        this.qualificationListFacade.createQualification(editedQualification);
    }
    this.qualificationToEdit = undefined;
  }

  public onDelete(qualificationId: string) {
    this.qualificationListFacade.deleteQualification(qualificationId);
  }
}
