import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { EmailVerifyComponent } from './email-verify.component';

describe('EmailVerifyComponent', () => {
  let component: EmailVerifyComponent;
  let fixture: ComponentFixture<EmailVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailVerifyComponent],
      providers: [
        ...getCommonTestProviders(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
