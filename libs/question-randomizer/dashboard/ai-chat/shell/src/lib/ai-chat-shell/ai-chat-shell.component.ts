import { Component, inject, OnInit } from '@angular/core';
import { ChatStore, ChatService } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-data-access';
import { ChatMessageComponent, ChatInputComponent } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-ui';

@Component({
  selector: 'lib-ai-chat-shell',
  imports: [ChatMessageComponent, ChatInputComponent],
  templateUrl: './ai-chat-shell.component.html',
  styleUrl: './ai-chat-shell.component.scss'
})
export class AiChatShellComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  protected readonly chatStore = inject(ChatStore);

  ngOnInit(): void {
    // Load conversations on init
    this.chatService.loadConversations().subscribe(conversations => {
      // Auto-select first conversation or create a new one
      if (conversations.length > 0) {
        this.selectConversation(conversations[0].id);
      } else {
        this.createNewConversation();
      }
    });
  }

  onSendMessage(message: string): void {
    this.chatService.sendMessage(message).subscribe();
  }

  selectConversation(conversationId: string): void {
    this.chatService.selectConversation(conversationId).subscribe();
  }

  createNewConversation(): void {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    this.chatService.createConversation(title).subscribe();
  }
}
