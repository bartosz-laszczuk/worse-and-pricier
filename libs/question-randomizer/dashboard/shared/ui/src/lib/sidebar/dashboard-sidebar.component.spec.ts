import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

describe('DashboardSidebarComponent', () => {
  let component: DashboardSidebarComponent;
  let fixture: ComponentFixture<DashboardSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSidebarComponent],
      providers: getCommonTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentLanguage', 'en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
