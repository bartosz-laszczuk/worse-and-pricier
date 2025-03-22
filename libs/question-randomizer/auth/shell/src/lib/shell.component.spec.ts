import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionRandomizerAuthShellComponent } from '../question-randomizer-auth-shell.component';

describe('QuestionRandomizerAuthShellComponent', () => {
  let component: QuestionRandomizerAuthShellComponent;
  let fixture: ComponentFixture<QuestionRandomizerAuthShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionRandomizerAuthShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionRandomizerAuthShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
