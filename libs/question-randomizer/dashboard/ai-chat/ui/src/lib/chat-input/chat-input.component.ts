import { ChangeDetectionStrategy, Component, output, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  disabled = input<boolean>(false);
  messageSent = output<string>();

  messageText = signal('');

  onSend(): void {
    const text = this.messageText().trim();
    if (text && !this.disabled()) {
      this.messageSent.emit(text);
      this.messageText.set('');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
