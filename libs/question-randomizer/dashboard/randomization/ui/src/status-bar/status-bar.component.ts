import { Component, input } from '@angular/core';


@Component({
  selector: 'lib-status-bar',
  imports: [],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
})
export class StatusBarComponent {
  public postponed = input<number>(0);
  public ahead = input<number>(0);
  public answered = input<number>(0);
}
