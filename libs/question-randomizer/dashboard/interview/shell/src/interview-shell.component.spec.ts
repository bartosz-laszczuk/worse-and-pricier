import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewShellComponent } from './interview-shell.component';

describe('InterviewShellComponent', () => {
  let component: InterviewShellComponent;
  let fixture: ComponentFixture<InterviewShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
