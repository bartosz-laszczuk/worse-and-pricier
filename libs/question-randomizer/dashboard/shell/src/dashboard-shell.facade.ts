import { inject, Injectable } from '@angular/core';
import { UserStore } from '@my-nx-monorepo/question-randomizer-shared-data-access';

@Injectable()
export class DashboardShellFacade {
  private readonly userStore = inject(UserStore);

  public loadLists() {}

  public signOut() {
    this.userStore.signOut();
  }
}
