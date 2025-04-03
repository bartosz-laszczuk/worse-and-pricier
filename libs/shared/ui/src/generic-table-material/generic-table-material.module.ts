import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { GenericTableMaterialComponent } from './generic-table-material.component';
import { GenericTableMaterialSortableHeaderComponent } from './_components/generic-table-material-sortable-header/generic-table-material-sortable-header.component';

@NgModule({
  declarations: [
    GenericTableMaterialComponent,
    GenericTableMaterialSortableHeaderComponent,
  ],
  imports: [CommonModule, MatTableModule],
  exports: [GenericTableMaterialComponent],
})
export class GenericTableMaterialModule {}
