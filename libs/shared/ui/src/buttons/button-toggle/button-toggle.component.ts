import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-button-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [class.selected]="selected"
      (click)="toggled.emit(value)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button-toggle.component.scss'],
})
export class ButtonToggleComponent {
  @Input() value!: any;
  @Input() selected = false;
  @Output() toggled = new EventEmitter<any>();
}
