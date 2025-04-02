import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditQualificationComponent } from './edit-qualification.component';

describe('EditQualificationComponent', () => {
  let component: EditQualificationComponent;
  let fixture: ComponentFixture<EditQualificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditQualificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
