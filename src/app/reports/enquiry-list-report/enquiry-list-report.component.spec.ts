import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryListReportComponent } from './enquiry-list-report.component';

describe('EnquiryListReportComponent', () => {
  let component: EnquiryListReportComponent;
  let fixture: ComponentFixture<EnquiryListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryListReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnquiryListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
