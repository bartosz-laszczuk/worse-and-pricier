import { Directive, Input, TemplateRef } from '@angular/core';
import { IComlumInputDirective } from '../table.models';

@Directive({
  selector: '[libColumn]',
})
export class ColumnDirective {
  @Input() sepisColumn!: IComlumInputDirective;
  constructor(public templateRef: TemplateRef<any>) {}
}
