import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputCheckGroupComponent } from './input-check-group.component';

describe('InputCheckGroupComponent', () => {
  let component: InputCheckGroupComponent;
  let fixture: ComponentFixture<InputCheckGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCheckGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputCheckGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
