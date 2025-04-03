import { Directive, Input, TemplateRef } from '@angular/core';
import { IComlumInputDirective } from './column.model';

@Directive({
  selector: '[myProjectsNxGenericTableBackendOperationsColumn]',
})
export class ColumnDirective {
  @Input() sepisColumn!: IComlumInputDirective;
  constructor(public templateRef: TemplateRef<any>) {}
}
