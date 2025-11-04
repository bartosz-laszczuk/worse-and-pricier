import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '@worse-and-pricier/question-randomizer-shared-data-access';
import {
  CategoryListService,
  CategoryListStore,
  QualificationListService,
  QualificationListStore,
  QuestionListService,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import { forkJoin } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class DashboardShellFacade {
  private readonly userService = inject(UserService);
  private readonly questionListService = inject(QuestionListService);
  private readonly categoryListService = inject(CategoryListService);
  private readonly categoryListStore = inject(CategoryListStore);
  private readonly qualificationListService = inject(QualificationListService);
  private readonly qualificationListStore = inject(QualificationListStore);
  private readonly translocoService = inject(TranslocoService);

  public currentLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  constructor() {
    // Load language from localStorage on initialization
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pl')) {
      this.translocoService.setActiveLang(savedLanguage);
    }
  }

  public signOut() {
    this.userService.signOut();
  }

  public changeLanguage(language: string) {
    let langCode: string;
    if (language === 'english') {
      langCode = 'en';
    } else if (language === 'polish') {
      langCode = 'pl';
    } else {
      // Invalid/empty value - do nothing (happens when clicking already-selected button)
      return;
    }
    this.translocoService.setActiveLang(langCode);
    localStorage.setItem('language', langCode);
  }

  public loadLists() {
    forkJoin([
      this.categoryListService.loadCategoryList(),
      this.qualificationListService.loadQualificationList(),
    ]).subscribe(() =>
      this.questionListService.loadQuestionList(
        this.categoryListStore.entities() ?? {},
        this.qualificationListStore.entities() ?? {}
      )
    );
  }
}
