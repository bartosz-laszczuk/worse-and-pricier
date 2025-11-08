import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RandomizationShellFacade } from './randomization-shell.facade';
import {
  ButtonIconComponent,
  CardComponent,
  InputCheckGroupComponent,
  ButtonGroupComponent,
} from '@worse-and-pricier/design-system-ui';
import {
  EditQuestionFormValue,
  FormatTagsPipe,
  NormalizeSpacePipe,
  Randomization,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import {
  StatusBarComponent,
  StatusCardComponent,
} from '@worse-and-pricier/question-randomizer-dashboard-randomization-ui';
import {
  EditQuestionComponent,
  EditQuestionDialogData,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-ui';
import { Dialog } from '@angular/cdk/dialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'lib-randomization-shell',
  imports: [
    InputCheckGroupComponent,
    CardComponent,
    StatusCardComponent,
    StatusBarComponent,
    ButtonGroupComponent,
    ButtonIconComponent,
    FormatTagsPipe,
    TranslocoModule,
    NormalizeSpacePipe,
  ],
  templateUrl: './randomization-shell.component.html',
  styleUrl: './randomization-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RandomizationShellFacade],
})
export class RandomizationShellComponent {
  private readonly randomizationShellFacade = inject(RandomizationShellFacade);
  private readonly dialog = inject(Dialog);
  private readonly translocoService = inject(TranslocoService);

  public randomization = this.randomizationShellFacade.randomization;
  public currentQuestion = this.randomizationShellFacade.currentQuestion;
  public categoryOptionItemList =
    this.randomizationShellFacade.categoryOptionItemList;
  public qualificationOptionItemList =
    this.randomizationShellFacade.qualificationOptionItemList;
  public selectedCategoryIdList =
    this.randomizationShellFacade.selectedCategoryIdList;
  public usedQuestionListLength =
    this.randomizationShellFacade.usedQuestionListLength;
  public postponedQuestionListLength =
    this.randomizationShellFacade.postponedQuestionListLength;
  public availableQuestionListLength =
    this.randomizationShellFacade.availableQuestionListLength;

  // Language-aware answer selection
  public currentLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  public currentAnswer = computed(() => {
    const question = this.currentQuestion();
    const language = this.currentLanguage();

    if (!question) return '';

    return language === 'pl' ? question.answerPl : question.answer;
  });

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

  public onEditQuestion() {
    const question = this.currentQuestion();
    if (!question) return;

    const dialogRef = this.dialog.open<
      EditQuestionFormValue | undefined,
      EditQuestionDialogData
    >(EditQuestionComponent, {
      data: {
        question,
        categoryOptionItemList: this.categoryOptionItemList(),
        qualificationOptionItemList: this.qualificationOptionItemList(),
      },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.randomizationShellFacade.updateQuestion(question.id, result);
      }
    });
  }
}
