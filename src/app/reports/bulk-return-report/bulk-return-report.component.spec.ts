import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnReportComponent } from './bulk-return-report.component';

describe('BulkReturnReportComponent', () => {
  let component: BulkReturnReportComponent;
  let fixture: ComponentFixture<BulkReturnReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
