import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'lib-button-icon',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss',
})
export class ButtonIconComponent {}
