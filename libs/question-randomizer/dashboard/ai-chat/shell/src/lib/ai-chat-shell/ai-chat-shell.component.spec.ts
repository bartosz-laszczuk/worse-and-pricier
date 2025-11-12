import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiChatShellComponent } from './ai-chat-shell.component';

describe('AiChatShellComponent', () => {
  let component: AiChatShellComponent;
  let fixture: ComponentFixture<AiChatShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiChatShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiChatShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
