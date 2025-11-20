import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { SettingsShellComponent } from './settings-shell.component';

describe('SettingsShellComponent', () => {
  let component: SettingsShellComponent;
  let fixture: ComponentFixture<SettingsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsShellComponent],
      providers: getCommonTestProviders(),
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
