import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { LoginComponent } from './login.component';
import { UserStore, AuthRepository } from '@worse-and-pricier/question-randomizer-shared-data-access';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        ...getCommonTestProviders(),
        UserStore,
        AuthRepository,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with email and password controls', () => {
    expect(component.form).toBeDefined();
    expect(component.form.controls.email).toBeDefined();
    expect(component.form.controls.password).toBeDefined();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form when filled correctly', () => {
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
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
