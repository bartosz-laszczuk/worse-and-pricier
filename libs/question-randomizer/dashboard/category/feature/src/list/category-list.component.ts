import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditCategoryComponent } from '@my-nx-monorepo/question-randomizer-dashboard-category-ui';
import { EditCategoryFormValue } from '@my-nx-monorepo/question-randomizer-dashboard-category-util';
import { CategoryListFacade } from './category-list.facade';

@Component({
  selector: 'lib-category-list',
  imports: [CommonModule, EditCategoryComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CategoryListFacade],
})
export class CategoryListComponent {
  private readonly categoryListFacade = inject(CategoryListFacade);
  public editCategoryOpened = false;

  public onCreate(formValue: EditCategoryFormValue) {
    this.categoryListFacade.createCategory(formValue);
  }

  public getCategories() {
    // this.categoryListFacade.getCategories;
  }
}
