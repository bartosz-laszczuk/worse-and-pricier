import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonType } from '@my-nx-monorepo/shared-util';

@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public type = input<ButtonType>('default');
}
