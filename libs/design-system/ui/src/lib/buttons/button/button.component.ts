import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonType } from '../../enums/button-type.enum';

/**
 * A reusable button component with theming support and hover animations.
 *
 * @example
 * ```html
 * <lib-button type="default">Click me</lib-button>
 * <lib-button type="dark">Dark button</lib-button>
 * <lib-button type="light">Light button</lib-button>
 * ```
 */
@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Button visual style variant (default, dark, light, icon) */
  public type = input<ButtonType>('default');
}
