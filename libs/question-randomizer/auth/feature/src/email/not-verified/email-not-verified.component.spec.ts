import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { EmailNotVerifiedComponent } from './email-not-verified.component';
import { UserStore, AuthRepository } from '@worse-and-pricier/question-randomizer-shared-data-access';

describe('EmailNotVerifiedComponent', () => {
  let component: EmailNotVerifiedComponent;
  let fixture: ComponentFixture<EmailNotVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNotVerifiedComponent],
      providers: [
        ...getCommonTestProviders(),
        UserStore,
        AuthRepository,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailNotVerifiedComponent);
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

  it('should have onSignOut method', () => {
    expect(component.onSignOut).toBeDefined();
    expect(typeof component.onSignOut).toBe('function');
  });
});
