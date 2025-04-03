import { Injectable, QueryList } from '@angular/core';
import { ColumnDirective } from '../_models/column.directive';
import { TypeOfTemplateEnum } from '../_models/column.model';

@Injectable()
export class TableService {
  getTemplates(columnTemps: QueryList<ColumnDirective>): {
    columns: Record<string, ColumnDirective>;
    filters: Record<string, ColumnDirective>;
  } {
    this.setColumnsViewDef(columnTemps);
    this.setColumnsFiltersDef(columnTemps);
    return { columns: this._columnTemplates, filters: this._filterTemplates };
  }

  private _columnTemplates: Record<string, ColumnDirective> = {};
  private _filterTemplates: Record<string, ColumnDirective> = {};

  private setColumnsViewDef(columnTemps: QueryList<ColumnDirective>): void {
    this._columnTemplates = columnTemps
      .filter((item) => item.sepisColumn.type === TypeOfTemplateEnum.COLUMN)
      .reduce((i, curr) => {
        return {
          ...i,
          [curr.sepisColumn.propertyName]: curr,
        };
      }, {});
  }

  private setColumnsFiltersDef(columnTemps: QueryList<ColumnDirective>): void {
    this._filterTemplates = columnTemps
      .filter((item) => item.sepisColumn?.type === TypeOfTemplateEnum.FILTER)
      .reduce((i, curr) => {
        return {
          ...i,
          [curr.sepisColumn.propertyName]: curr,
        };
      }, {});
  }
}
