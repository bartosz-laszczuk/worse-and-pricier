import { Directive, inject, Input, TemplateRef } from '@angular/core';
import { IColumnInputDirective } from '../table.models';

@Directive({
  selector: '[libColumn]',
})
export class ColumnDirective {
  @Input() libColumn!: IColumnInputDirective;
  public templateRef = inject(TemplateRef<unknown>);
}
