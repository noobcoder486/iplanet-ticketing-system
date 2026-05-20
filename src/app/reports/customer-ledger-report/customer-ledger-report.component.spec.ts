import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLedgerReportComponent } from './customer-ledger-report.component';

describe('CustomerLedgerReportComponent', () => {
  let component: CustomerLedgerReportComponent;
  let fixture: ComponentFixture<CustomerLedgerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerLedgerReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerLedgerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
