import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenJobReportComponent } from './open-job-report.component';

describe('OpenJobReportComponent', () => {
  let component: OpenJobReportComponent;
  let fixture: ComponentFixture<OpenJobReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenJobReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenJobReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
