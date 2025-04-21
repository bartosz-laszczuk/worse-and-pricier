import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputRichTextEditorComponent } from './input-rich-text-editor.component';

describe('InputRichTextEditorComponent', () => {
  let component: InputRichTextEditorComponent;
  let fixture: ComponentFixture<InputRichTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputRichTextEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputRichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
