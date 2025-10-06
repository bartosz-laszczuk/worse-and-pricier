import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { QualificationListFacade } from './qualification-list.facade';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { EditQualificationComponent } from '@my-nx-monorepo/question-randomizer-dashboard-qualification-ui';
import {
  ButtonComponent,
  ColumnDirective,
  IColumn,
  InputTextComponent,
  PageEvent,
  TableComponent,
} from '@my-nx-monorepo/shared-ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, take } from 'rxjs';
import { SortDefinition } from '@my-nx-monorepo/shared-util';

@Component({
  selector: 'lib-qualification-list',
  imports: [
    EditQualificationComponent,
    TableComponent,
    SvgIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ColumnDirective,
    ButtonComponent,
  ],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QualificationListFacade],
})
export class QualificationListComponent {
  private readonly qualificationListFacade = inject(QualificationListFacade);
  public qualifications = this.qualificationListFacade.qualifications;
  public sort = this.qualificationListFacade.sort;
  public page = this.qualificationListFacade.page;
  public filteredCount = this.qualificationListFacade.filteredCount;
  public qualificationToEdit?: Qualification = undefined;
  public searchTextControl = new FormControl('', {
    nonNullable: true,
  });

  public columns: IColumn[] = [
    {
      displayName: 'Name',
      propertyName: 'name',
      sortable: true,
    },
    { displayName: '', propertyName: 'edit', width: '3.5rem', center: true },
    { displayName: '', propertyName: 'delete', width: '3.5rem', center: true },
  ];

  public constructor() {
    toObservable(this.qualificationListFacade.searchText)
      .pipe(take(1))
      .subscribe((value) =>
        this.searchTextControl.setValue(value, { emitEvent: false })
      );
    this.searchTextControl.valueChanges
      .pipe(debounceTime(100), takeUntilDestroyed())
      .subscribe((value) => this.qualificationListFacade.setSearchText(value));
  }

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

  public onSort(sort: SortDefinition<Qualification>): void {
    this.qualificationListFacade.setSort(sort);
  }

  public onPage(page: PageEvent) {
    this.qualificationListFacade.setPage(page);
  }
}
