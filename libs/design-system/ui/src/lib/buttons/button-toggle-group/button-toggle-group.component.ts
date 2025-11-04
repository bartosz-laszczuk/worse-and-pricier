import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  input,
  output,
  signal,
  effect,
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
  public value = input<T | undefined>();
  public toggled = output<T | undefined>();
  public allowDeselect = input<boolean>(true);
  @ContentChildren(ButtonToggleComponent)
  toggles!: QueryList<ButtonToggleComponent<T>>;

  // Signal for tracking the current selected value
  public selectedValue = signal<T | undefined>(undefined);

  constructor() {
    // Sync input value to internal signal
    effect(() => {
      this.selectedValue.set(this.value());
    });
  }

  ngAfterContentInit() {
    this.selectedValue.set(this.value());
    this.toggles.forEach((toggle) => {
      toggle.toggled.subscribe((val) => this.handleToggle(val));
    });
  }

  handleToggle(val: T) {
    const isCurrentlySelected = this.selectedValue() === val;
    const newValue = isCurrentlySelected && this.allowDeselect() ? undefined : val;
    this.selectedValue.set(newValue);
    this.toggled.emit(newValue);
  }
}
