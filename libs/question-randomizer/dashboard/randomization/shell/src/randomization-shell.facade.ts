import { inject, Injectable } from '@angular/core';
import { RandomizationStore } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-data-access';

Injectable();
export class RandomizationShellFacade {
  private readonly randomizationStore = inject(RandomizationStore);

  public loadRandomization() {
    this.randomizationStore.loadRandomization();
  }
}
