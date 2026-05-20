import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundCallManagementReportComponent } from './inbound-call-management-report.component';

describe('InboundCallManagementReportComponent', () => {
  let component: InboundCallManagementReportComponent;
  let fixture: ComponentFixture<InboundCallManagementReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboundCallManagementReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundCallManagementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
