import { Injectable, QueryList } from '@angular/core';
import { ColumnDirective } from './column-directive/column.directive';
import { TemplateType } from './table.models';

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
      .filter((item) => item.libColumn().type === TemplateType.Column)
      .reduce((i, curr) => {
        return {
          ...i,
          [curr.libColumn().propertyName]: curr,
        };
      }, {});
  }

  private setColumnsFiltersDef(columnTemps: QueryList<ColumnDirective>): void {
    this._filterTemplates = columnTemps
      .filter((item) => item.libColumn().type === TemplateType.Filter)
      .reduce((i, curr) => {
        return {
          ...i,
          [curr.libColumn().propertyName]: curr,
        };
      }, {});
  }
}
