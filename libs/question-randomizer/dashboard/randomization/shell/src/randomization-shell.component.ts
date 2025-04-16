import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RandomizationShellFacade } from './randomization-shell.facade';
import {
  RandomizationService,
  RandomizationStore,
} from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';

@Component({
  selector: 'lib-randomization-shell',
  imports: [CommonModule],
  templateUrl: './randomization-shell.component.html',
  styleUrl: './randomization-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RandomizationShellFacade,
    RandomizationStore,
    RandomizationService,
  ],
})
export class RandomizationShellComponent {
  private readonly randomizationShellFacade = inject(RandomizationShellFacade);
  constructor() {
    this.randomizationShellFacade.loadRandomization();
  }
}
