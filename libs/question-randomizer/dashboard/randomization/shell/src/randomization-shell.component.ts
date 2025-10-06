import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RandomizationShellFacade } from './randomization-shell.facade';
import {
  ButtonIconComponent,
  CardComponent,
  InputCheckGroupComponent,
  ButtonGroupComponent,
} from '@my-nx-monorepo/design-system-ui';
import { Randomization } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import {
  StatusBarComponent,
  StatusCardComponent,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-ui';

@Component({
  selector: 'lib-randomization-shell',
  imports: [
    InputCheckGroupComponent,
    CardComponent,
    StatusCardComponent,
    StatusBarComponent,
    ButtonGroupComponent,
    ButtonIconComponent
],
  templateUrl: './randomization-shell.component.html',
  styleUrl: './randomization-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RandomizationShellFacade],
})
export class RandomizationShellComponent {
  private readonly randomizationShellFacade = inject(RandomizationShellFacade);

  public randomization = this.randomizationShellFacade.randomization;
  public currentQuestion = this.randomizationShellFacade.currentQuestion;
  public categoryOptionItemList =
    this.randomizationShellFacade.categoryOptionItemList;
  public selectedCategoryIdList =
    this.randomizationShellFacade.selectedCategoryIdList;
  public usedQuestionListLength =
    this.randomizationShellFacade.usedQuestionListLength;
  public postponedQuestionListLength =
    this.randomizationShellFacade.postponedQuestionListLength;
  public availableQuestionListLength =
    this.randomizationShellFacade.availableQuestionListLength;

  constructor() {
    this.randomizationShellFacade.loadRandomization();
  }

  public onCheckboxChange(
    // event: Event,
    value: string,
    checked: boolean,
    randomizationId: string
  ) {
    // const isChecked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.randomizationShellFacade.selectCategoryForRandomization(
        value,
        randomizationId
      );
    } else {
      this.randomizationShellFacade.deselectCategoryFromRandomization(
        value,
        randomizationId
      );
    }
  }

  public onNextQuestion(randomizationId: string) {
    this.randomizationShellFacade.nextQuestion(randomizationId);
  }

  public onPostponeQuestion(randomizationId: string) {
    this.randomizationShellFacade.postponeQuestion(randomizationId);
  }

  public onPreviousQuestion(randomizationId: string) {
    this.randomizationShellFacade.previousQuestion(randomizationId);
  }

  public onToggleAnswer(
    currentShowAnswer: boolean,
    randomization: Randomization
  ) {
    this.randomizationShellFacade.updateRandomization({
      ...randomization,
      showAnswer: !currentShowAnswer,
    });
  }

  public onReset(randomizationId: string) {
    this.randomizationShellFacade.resetRandomization(randomizationId);
  }
}
