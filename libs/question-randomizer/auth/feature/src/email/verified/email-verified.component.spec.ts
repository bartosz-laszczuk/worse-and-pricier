import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { EmailVerifiedComponent } from './email-verified.component';
import { UserStore, AuthRepository } from '@worse-and-pricier/question-randomizer-shared-data-access';

describe('EmailVerifiedComponent', () => {
  let component: EmailVerifiedComponent;
  let fixture: ComponentFixture<EmailVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailVerifiedComponent],
      providers: [
        ...getCommonTestProviders(),
        UserStore,
        AuthRepository,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigateToDashboard method', () => {
    expect(component.navigateToDashboard).toBeDefined();
    expect(typeof component.navigateToDashboard).toBe('function');
  });
});
