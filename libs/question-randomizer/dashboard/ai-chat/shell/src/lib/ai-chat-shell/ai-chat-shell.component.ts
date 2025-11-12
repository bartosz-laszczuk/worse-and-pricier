import { Component, inject, OnInit } from '@angular/core';
import { ChatMessageComponent, ChatInputComponent } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-ui';
import { AiChatShellFacade } from './ai-chat-shell.facade';

@Component({
  selector: 'lib-ai-chat-shell',
  imports: [ChatMessageComponent, ChatInputComponent],
  templateUrl: './ai-chat-shell.component.html',
  styleUrl: './ai-chat-shell.component.scss',
  providers: [AiChatShellFacade],
})
export class AiChatShellComponent implements OnInit {
  private readonly facade = inject(AiChatShellFacade);

  protected readonly chatStore = this.facade.chatStore;

  ngOnInit(): void {
    this.facade.loadInitialConversations();
  }

  onSendMessage(message: string): void {
    this.facade.sendMessage(message);
  }

  selectConversation(conversationId: string): void {
    this.facade.selectConversation(conversationId);
  }

  createNewConversation(): void {
    this.facade.createNewConversation();
  }
}
