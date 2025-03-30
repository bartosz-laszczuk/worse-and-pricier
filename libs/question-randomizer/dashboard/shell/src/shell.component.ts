import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShellFacade } from './shell.facade';

@Component({
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  providers: [ShellFacade],
})
export class ShellComponent {
  private readonly shellFacade = inject(ShellFacade);

  public onSignOut() {
    this.shellFacade.signOut();
  }
}
