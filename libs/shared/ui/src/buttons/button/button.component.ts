import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const ButtonTypes = ['default', 'dark', 'light'] as const;
type ButtonType = (typeof ButtonTypes)[number];

@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public type = input<ButtonType>('default');
}
