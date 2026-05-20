import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationDetailsReportComponent } from './communication-details-report.component';

describe('CommunicationDetailsReportComponent', () => {
  let component: CommunicationDetailsReportComponent;
  let fixture: ComponentFixture<CommunicationDetailsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationDetailsReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationDetailsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
