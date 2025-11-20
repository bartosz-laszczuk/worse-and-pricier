import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { RegistrationComponent } from './registration.component';
import { UserStore, AuthRepository } from '@worse-and-pricier/question-randomizer-shared-data-access';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationComponent],
      providers: [
        ...getCommonTestProviders(),
        UserStore,
        AuthRepository,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with email, password, and passwordRepeat controls', () => {
    expect(component.form).toBeDefined();
    expect(component.form.controls.email).toBeDefined();
    expect(component.form.controls.password).toBeDefined();
    expect(component.form.controls.passwordRepeat).toBeDefined();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form when filled correctly', () => {
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.passwordRepeat.setValue('password123');
    expect(component.form.valid).toBe(true);
  });

  it('should invalidate email with invalid format', () => {
    component.form.controls.email.setValue('invalid-email');
    expect(component.form.controls.email.valid).toBe(false);
  });

  it('should invalidate password when too long', () => {
    component.form.controls.password.setValue('a'.repeat(129));
    expect(component.form.controls.password.valid).toBe(false);
  });

  it('should mark form as touched when submitted with invalid data', () => {
    jest.spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });
});
