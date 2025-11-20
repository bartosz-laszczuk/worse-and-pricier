import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonIconComponent } from './button-icon.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAngularSvgIcon } from 'angular-svg-icon';

describe('ButtonIconComponent', () => {
  let component: ButtonIconComponent;
  let fixture: ComponentFixture<ButtonIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonIconComponent],
      providers: [provideHttpClient(), provideAngularSvgIcon()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonIconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'arrow-right');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
