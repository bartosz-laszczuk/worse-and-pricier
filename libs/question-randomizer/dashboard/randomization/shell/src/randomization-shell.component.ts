import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RandomizationShellFacade } from './randomization-shell.facade';

@Component({
  selector: 'lib-randomization-shell',
  imports: [CommonModule],
  templateUrl: './randomization-shell.component.html',
  styleUrl: './randomization-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RandomizationShellFacade],
})
export class RandomizationShellComponent {}
