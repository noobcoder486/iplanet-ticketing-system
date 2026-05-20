import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterCompanyAmountTransferReportComponent } from './inter-company-amount-transfer-report.component';

describe('InterCompanyAmountTransferReportComponent', () => {
  let component: InterCompanyAmountTransferReportComponent;
  let fixture: ComponentFixture<InterCompanyAmountTransferReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterCompanyAmountTransferReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterCompanyAmountTransferReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
