import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHeaderComponent } from './dashboard-header.component';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';

describe('DashboardHeaderComponent', () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeaderComponent],
      providers: getCommonTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
