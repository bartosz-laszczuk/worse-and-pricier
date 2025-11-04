import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'lib-email-verify',
  imports: [TranslocoModule],
  templateUrl: './email-verify.component.html',
  styleUrl: './email-verify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerifyComponent {}
