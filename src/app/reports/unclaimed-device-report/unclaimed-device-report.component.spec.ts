import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnclaimedDeviceReportComponent } from './unclaimed-device-report.component';

describe('UnclaimedDeviceReportComponent', () => {
  let component: UnclaimedDeviceReportComponent;
  let fixture: ComponentFixture<UnclaimedDeviceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnclaimedDeviceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedDeviceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
