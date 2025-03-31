import { inject, Injectable } from '@angular/core';
import { CategoriesService } from '@my-nx-monorepo/question-randomizer-dashboard-category-data-access';
import { EditCategoryFormValue } from '@my-nx-monorepo/question-randomizer-dashboard-category-util';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Injectable()
export class CategoryListFacade {
  private readonly userStore = inject(UserStore);
  private readonly categoriesService = inject(CategoriesService);

  public createCategory(formValue: EditCategoryFormValue) {
    const category: Category = {
      name: formValue.name,
      userId: this.userStore.uid()!,
    };
    this.categoriesService.createCategory(category);
  }
}
