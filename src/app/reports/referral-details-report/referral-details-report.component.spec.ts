import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralDetailsReportComponent } from './referral-details-report.component';

describe('ReferralDetailsReportComponent', () => {
  let component: ReferralDetailsReportComponent;
  let fixture: ComponentFixture<ReferralDetailsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralDetailsReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralDetailsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
