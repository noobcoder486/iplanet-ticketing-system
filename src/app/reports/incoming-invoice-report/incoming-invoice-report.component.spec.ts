import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingInvoiceReportComponent } from './incoming-invoice-report.component';

describe('IncomingInvoiceReportComponent', () => {
  let component: IncomingInvoiceReportComponent;
  let fixture: ComponentFixture<IncomingInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomingInvoiceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
