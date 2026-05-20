import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySummaryReportComponent } from './daily-summary-report.component';

describe('DailySummaryReportComponent', () => {
  let component: DailySummaryReportComponent;
  let fixture: ComponentFixture<DailySummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailySummaryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailySummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
