import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationReportComponent } from './cancellation-report.component';

describe('CancellationReportComponent', () => {
  let component: CancellationReportComponent;
  let fixture: ComponentFixture<CancellationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancellationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancellationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
