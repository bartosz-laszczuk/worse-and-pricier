import { Component, HostBinding, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusCardType =
  | 'primary'
  | 'secondary'
  | 'gray-500'
  | 'gray-600'
  | 'gray-700'
  | 'gray-800';

@Component({
  selector: 'lib-status-card',
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.scss',
})
export class StatusCardComponent {
  public count = input<number>(0);
  public title = input<string>('');
  public type = input<StatusCardType>('primary');

  @HostBinding('class')
  get hostClass(): string {
    return `status-card-${this.type()}`;
  }
}
