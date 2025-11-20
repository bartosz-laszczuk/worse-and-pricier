import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { EditQuestionComponent } from './edit-question.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

describe('EditQuestionComponent', () => {
  let component: EditQuestionComponent;
  let fixture: ComponentFixture<EditQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditQuestionComponent],
      providers: [
        ...getCommonTestProviders(),
        {
          provide: DIALOG_DATA,
          useValue: {
            question: {
              id: 'test',
              question: 'test question',
              questionPl: 'test question pl',
              answer: 'test answer',
              answerPl: 'test answer pl',
              categoryId: 'cat1',
              qualificationIds: [],
              isActive: true,
            },
          },
        },
        {
          provide: DialogRef,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
