import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButonTextIconComponent } from './buton-text-icon.component';

describe('ButonTextIconComponent', () => {
  let component: ButonTextIconComponent;
  let fixture: ComponentFixture<ButonTextIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButonTextIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButonTextIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
