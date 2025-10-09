import {
  Component,
  input,
  output,
  computed,
  inject,
} from '@angular/core';
import { ButtonToggleGroupComponent } from '../button-toggle-group/button-toggle-group.component';

@Component({
  selector: 'lib-button-toggle',
  standalone: true,
  imports: [],
  template: `
    <button
      type="button"
      [class.selected]="isSelected()"
      (click)="toggled.emit(value())"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button-toggle.component.scss'],
})
export class ButtonToggleComponent<T = unknown> {
  public value = input.required<T>();
  public toggled = output<T>();

  // Inject parent group (optional if used standalone)
  private readonly parentGroup = inject(ButtonToggleGroupComponent<T>, {
    optional: true,
  });

  // Compute selected state based on parent's selectedValue
  public isSelected = computed(() => {
    if (!this.parentGroup) return false;
    return this.parentGroup.selectedValue() === this.value();
  });
}
