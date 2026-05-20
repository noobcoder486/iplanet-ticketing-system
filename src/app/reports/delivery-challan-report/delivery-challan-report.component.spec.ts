import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryChallanReportComponent } from './delivery-challan-report.component';

describe('DeliveryChallanReportComponent', () => {
  let component: DeliveryChallanReportComponent;
  let fixture: ComponentFixture<DeliveryChallanReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryChallanReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryChallanReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
