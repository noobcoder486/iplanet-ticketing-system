import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationReportComponent } from './quotation-report.component';

describe('QuotationReportComponent', () => {
  let component: QuotationReportComponent;
  let fixture: ComponentFixture<QuotationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
