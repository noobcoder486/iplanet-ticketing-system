import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterReportComponent } from './cash-register-report.component';

describe('CashRegisterReportComponent', () => {
  let component: CashRegisterReportComponent;
  let fixture: ComponentFixture<CashRegisterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashRegisterReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
