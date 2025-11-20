import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { AuthShellComponent } from './auth-shell.component';

describe('AuthShellComponent', () => {
  let component: AuthShellComponent;
  let fixture: ComponentFixture<AuthShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthShellComponent],
      providers: getCommonTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(AuthShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
