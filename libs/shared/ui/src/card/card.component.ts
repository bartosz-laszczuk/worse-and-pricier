import { Component, input } from '@angular/core';


@Component({
  selector: 'lib-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  public title = input<string | undefined>();
}
