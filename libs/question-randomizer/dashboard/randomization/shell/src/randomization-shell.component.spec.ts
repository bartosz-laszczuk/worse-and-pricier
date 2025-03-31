import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomizationShellComponent } from './randomization-shell.component';

describe('RandomizationShellComponent', () => {
  let component: RandomizationShellComponent;
  let fixture: ComponentFixture<RandomizationShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomizationShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RandomizationShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
