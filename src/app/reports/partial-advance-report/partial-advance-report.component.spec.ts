import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialAdvanceReportComponent } from './partial-advance-report.component';

describe('PartialAdvanceReportComponent', () => {
  let component: PartialAdvanceReportComponent;
  let fixture: ComponentFixture<PartialAdvanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartialAdvanceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialAdvanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
