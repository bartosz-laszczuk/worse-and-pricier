import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputSelectComponent } from './input-select.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('InputSelectComponent', () => {
  let component: InputSelectComponent;
  let fixture: ComponentFixture<InputSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSelectComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
