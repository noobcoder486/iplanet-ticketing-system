import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadManagementReportComponent } from './lead-management-report.component';

describe('LeadManagementReportComponent', () => {
  let component: LeadManagementReportComponent;
  let fixture: ComponentFixture<LeadManagementReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadManagementReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadManagementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
