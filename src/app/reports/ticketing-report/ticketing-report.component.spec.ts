import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketingReportComponent } from './ticketing-report.component';

describe('TicketingReportComponent', () => {
  let component: TicketingReportComponent;
  let fixture: ComponentFixture<TicketingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketingReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
