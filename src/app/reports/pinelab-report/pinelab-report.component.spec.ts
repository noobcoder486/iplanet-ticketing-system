import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinelabReportComponent } from './pinelab-report.component';

describe('PinelabReportComponent', () => {
  let component: PinelabReportComponent;
  let fixture: ComponentFixture<PinelabReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PinelabReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PinelabReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
