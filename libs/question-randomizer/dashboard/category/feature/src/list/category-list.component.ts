import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditCategoryComponent } from '@my-nx-monorepo/question-randomizer-dashboard-category-ui';
import { CategoryListFacade } from './category-list.facade';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';

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
  public categories = this.categoryListFacade.categories;
  public categoryToEdit?: Category = undefined;

  public onAdd() {
    this.categoryToEdit = { id: '', name: '', userId: '' };
  }

  public onClose(editedCategory?: Category) {
    if (editedCategory) {
      if (editedCategory.id)
        this.categoryListFacade.updateCategory(editedCategory);
      else this.categoryListFacade.createCategory(editedCategory);
    }
    this.categoryToEdit = undefined;
  }

  public onDelete(categoryId: string) {
    this.categoryListFacade.deleteCategory(categoryId);
  }
}
