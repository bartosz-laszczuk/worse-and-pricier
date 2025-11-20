import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { EditQualificationComponent } from './edit-qualification.component';

describe('EditQualificationComponent', () => {
  let component: EditQualificationComponent;
  let fixture: ComponentFixture<EditQualificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditQualificationComponent],
      providers: getCommonTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(EditQualificationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('qualification', { id: 'test', name: 'Test Qualification' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
