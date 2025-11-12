import { inject, Injectable } from '@angular/core';
import { ChatStore, ChatService } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-data-access';

@Injectable()
export class AiChatShellFacade {
  private readonly chatService = inject(ChatService);
  public readonly chatStore = inject(ChatStore);

  public loadInitialConversations(): void {
    this.chatService.loadConversations().subscribe(conversations => {
      // Auto-select first conversation or create a new one
      if (conversations.length > 0) {
        this.selectConversation(conversations[0].id);
      } else {
        this.createNewConversation();
      }
    });
  }

  public sendMessage(message: string): void {
    this.chatService.sendMessage(message).subscribe();
  }

  public selectConversation(conversationId: string): void {
    this.chatService.selectConversation(conversationId).subscribe();
  }

  public createNewConversation(): void {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    this.chatService.createConversation(title).subscribe();
  }
}
