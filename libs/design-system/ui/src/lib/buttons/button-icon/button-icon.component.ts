import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ButtonType } from '../../enums/button-type.enum';

/** Available icon names for the button icon component */
export const Icons = [
  'arrow-left',
  'arrow-right',
  'corner-up-right',
  'rotate-ccw',
  'eye',
  'eye-off',
  'edit',
] as const;
export type IconName = (typeof Icons)[number];

/**
 * Available animation types for icon buttons
 * - bounce-left-right: Horizontal bounce animation from left to right
 * - bounce-right-left: Horizontal bounce animation from right to left
 * - rotate360: Clockwise rotation animation
 * - rotate360-counter: Counter-clockwise rotation animation
 */
export const Animations = [
  'bounce-left-right',
  'bounce-right-left',
  'rotate360',
  'rotate360-counter',
] as const;
export type Animation = (typeof Animations)[number];

/**
 * Icon button component with optional animations.
 *
 * @example
 * ```html
 * <lib-button-icon icon="arrow-right" type="default"></lib-button-icon>
 * <lib-button-icon icon="rotate-ccw" animation="rotate360"></lib-button-icon>
 * ```
 */
@Component({
  selector: 'lib-button-icon',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss',
})
export class ButtonIconComponent {
  /** Icon to display (required) */
  public icon = input.required<IconName>();
  /** Button visual style variant */
  public type = input<ButtonType>('default');
  /** Optional animation to apply to the icon */
  public animation = input<Animation | undefined>(undefined);

  public buttonClass = computed(() => {
    const type = this.type();
    const animation = this.animation();
    const classes: Record<string, boolean> = {
      dark: type === 'dark',
      light: type === 'light',
      icon: type === 'icon',
    };

    if (animation) classes[`animate-${animation}`] = true;
    return classes;
  });
}
