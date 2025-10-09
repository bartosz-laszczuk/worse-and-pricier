import { Component, input } from '@angular/core';

/**
 * A reusable card container component with optional title.
 *
 * @example
 * ```html
 * <lib-card title="Card Title">
 *   <p>Card content goes here</p>
 * </lib-card>
 * ```
 */
@Component({
  selector: 'lib-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  /** Optional title displayed at the top of the card */
  public title = input<string | undefined>();
}
