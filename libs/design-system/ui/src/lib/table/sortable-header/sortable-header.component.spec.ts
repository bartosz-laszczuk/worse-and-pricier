import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortableHeaderComponent } from './sortable-header.component';

describe('SortableHeaderComponent', () => {
  let component: SortableHeaderComponent<unknown>;
  let fixture: ComponentFixture<SortableHeaderComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortableHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SortableHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('column', { id: 'test', label: 'Test' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
