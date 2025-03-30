import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomizationDisplayComponent } from './randomization-display.component';

describe('RandomizationDisplayComponent', () => {
  let component: RandomizationDisplayComponent;
  let fixture: ComponentFixture<RandomizationDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomizationDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RandomizationDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
