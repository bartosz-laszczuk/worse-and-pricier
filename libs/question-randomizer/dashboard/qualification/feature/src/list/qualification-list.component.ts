import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-qualification-list',
  imports: [CommonModule],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualificationListComponent {}
