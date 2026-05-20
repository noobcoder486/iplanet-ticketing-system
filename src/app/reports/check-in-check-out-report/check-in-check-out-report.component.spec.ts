import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInCheckOutReportComponent } from './check-in-check-out-report.component';

describe('CheckInCheckOutReportComponent', () => {
  let component: CheckInCheckOutReportComponent;
  let fixture: ComponentFixture<CheckInCheckOutReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckInCheckOutReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInCheckOutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
