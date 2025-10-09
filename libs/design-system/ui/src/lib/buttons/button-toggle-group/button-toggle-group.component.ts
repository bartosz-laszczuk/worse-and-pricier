import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { ButtonToggleComponent } from '../button-toggle/button-toggle.component';

@Component({
  selector: 'lib-button-toggle-group',
  standalone: true,
  imports: [],
  template: `
    <div class="toggle-group-container">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./button-toggle-group.component.scss'],
})
export class ButtonToggleGroupComponent<T = unknown> implements AfterContentInit {
  @Input() value?: T;
  @Output() toggled = new EventEmitter<T | undefined>();
  @ContentChildren(ButtonToggleComponent)
  toggles!: QueryList<ButtonToggleComponent<T>>;

  ngAfterContentInit() {
    this.toggles.forEach((toggle) => {
      toggle.selected = toggle.value === this.value;
      toggle.toggled.subscribe((val) => this.handleToggle(val));
    });
  }

  handleToggle(val: T) {
    this.value = this.value === val ? undefined : val;
    this.toggled.emit(this.value);
    this.updateSelection();
  }

  updateSelection() {
    this.toggles.forEach((toggle) => {
      toggle.selected = toggle.value === this.value;
    });
  }
}
