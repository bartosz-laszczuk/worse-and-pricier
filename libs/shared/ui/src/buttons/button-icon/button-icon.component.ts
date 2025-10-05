import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ButtonType } from '@my-nx-monorepo/shared-util';

export const Icons = [
  'arrow-left',
  'arrow-right',
  'corner-up-right',
  'rotate-ccw',
  'eye',
  'eye-off',
  'edit',
] as const;
export type Icon = (typeof Icons)[number];

export const Animations = [
  'bounce-left-right',
  'bounce-right-left',
  'rotate360',
  'rotate360-counter',
] as const;
export type Animation = (typeof Animations)[number];

@Component({
  selector: 'lib-button-icon',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss',
})
export class ButtonIconComponent {
  public icon = input.required<Icon>();
  public type = input<ButtonType>('default');
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
