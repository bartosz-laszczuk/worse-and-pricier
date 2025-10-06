import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonShadowComponent } from './button-shadow.component';

describe('ButtonShadowComponent', () => {
  let component: ButtonShadowComponent;
  let fixture: ComponentFixture<ButtonShadowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonShadowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonShadowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
