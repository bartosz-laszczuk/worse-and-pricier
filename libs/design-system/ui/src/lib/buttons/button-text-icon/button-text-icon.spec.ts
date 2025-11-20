import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonTextIconComponent } from './button-text-icon.component';

describe('ButtonTextIconComponent', () => {
  let component: ButtonTextIconComponent;
  let fixture: ComponentFixture<ButtonTextIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonTextIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonTextIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
