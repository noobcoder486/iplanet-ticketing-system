import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentReportComponent } from './advance-payment-report.component';

describe('AdvancePaymentReportComponent', () => {
  let component: AdvancePaymentReportComponent;
  let fixture: ComponentFixture<AdvancePaymentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancePaymentReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancePaymentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
