import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AiChatShellComponent } from './ai-chat-shell.component';
import { ChatService, ChatStore } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-data-access';

describe('AiChatShellComponent', () => {
  let component: AiChatShellComponent;
  let fixture: ComponentFixture<AiChatShellComponent>;
  let mockChatService: jest.Mocked<ChatService>;
  let mockChatStore: Partial<ChatStore>;

  beforeEach(async () => {
    mockChatService = {
      loadConversations: jest.fn().mockReturnValue(of([])),
      sendMessage: jest.fn().mockReturnValue(of(undefined)),
      selectConversation: jest.fn().mockReturnValue(of(undefined)),
      createConversation: jest.fn().mockReturnValue(of(undefined)),
    } as unknown as jest.Mocked<ChatService>;

    mockChatStore = {
      conversations: jest.fn().mockReturnValue([]),
      currentConversation: jest.fn().mockReturnValue(null),
      messages: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      error: jest.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [AiChatShellComponent],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: ChatStore, useValue: mockChatStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiChatShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load conversations on init', () => {
    expect(mockChatService.loadConversations).toHaveBeenCalled();
  });
});
