import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDepositReportComponent } from './cash-deposit-report.component';

describe('CashDepositReportComponent', () => {
  let component: CashDepositReportComponent;
  let fixture: ComponentFixture<CashDepositReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDepositReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDepositReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
