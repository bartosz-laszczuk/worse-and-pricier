import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RandomizationShellFacade } from './randomization-shell.facade';
import {
  RandomizationService,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';

@Component({
  selector: 'lib-randomization-shell',
  imports: [CommonModule],
  templateUrl: './randomization-shell.component.html',
  styleUrl: './randomization-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RandomizationShellFacade,
    RandomizationStore,
    RandomizationService,
  ],
})
export class RandomizationShellComponent {
  private readonly randomizationShellFacade = inject(RandomizationShellFacade);

  public randomization = this.randomizationShellFacade.randomization;
  public currentQuestion = this.randomizationShellFacade.currentQuestion;
  public categoryOptionItemList =
    this.randomizationShellFacade.categoryOptionItemList;
  public selectedCategoryIdList =
    this.randomizationShellFacade.selectedCategoryIdList;

  constructor() {
    this.randomizationShellFacade.loadRandomization();
  }

  public onCheckboxChange(
    event: Event,
    value: string,
    randomizationId: string
  ) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.randomizationShellFacade.addCategoryToRandomization(
        value,
        randomizationId
      );
    } else {
      this.randomizationShellFacade.deleteCategoryFromRandomization(
        value,
        randomizationId
      );
    }
  }

  public onNextQuestion(randomizationId: string) {
    this.randomizationShellFacade.nextQuestion(randomizationId);
  }

  public onPreviousQuestion(randomizationId: string) {
    this.randomizationShellFacade.previousQuestion(randomizationId);
  }

  public onReset(randomizationId: string) {
    this.randomizationShellFacade.resetRandomization(randomizationId);
  }
}
