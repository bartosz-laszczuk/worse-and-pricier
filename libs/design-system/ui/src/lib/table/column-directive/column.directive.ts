import { Directive, inject, input, TemplateRef } from '@angular/core';
import { IColumnInputDirective } from '../table.models';

@Directive({
  selector: '[libColumn]',
  standalone: true,
})
export class ColumnDirective {
  public libColumn = input.required<IColumnInputDirective>();
  public templateRef = inject(TemplateRef<unknown>);
}
