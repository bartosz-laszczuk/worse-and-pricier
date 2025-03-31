import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrl: './email-verify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerifyComponent {}
