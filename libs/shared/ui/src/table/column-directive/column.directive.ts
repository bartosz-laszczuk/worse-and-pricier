import { Directive, Input, TemplateRef } from '@angular/core';
import { IComlumInputDirective } from '../table.models';

@Directive({
  selector: '[libColumn]',
})
export class ColumnDirective {
  @Input() libColumn!: IComlumInputDirective;
  constructor(public templateRef: TemplateRef<any>) {}
}
