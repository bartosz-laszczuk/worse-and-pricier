import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputRichTextEditorComponent } from './input-rich-text-editor.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

describe('InputRichTextEditorComponent', () => {
  let component: InputRichTextEditorComponent;
  let fixture: ComponentFixture<InputRichTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputRichTextEditorComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputRichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    component.control = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
