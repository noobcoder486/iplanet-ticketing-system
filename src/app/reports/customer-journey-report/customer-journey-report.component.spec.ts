import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJouneryReportComponent } from './customer-journey-report.component';

describe('CustomerJouneryReportComponent', () => {
  let component: CustomerJouneryReportComponent;
  let fixture: ComponentFixture<CustomerJouneryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerJouneryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerJouneryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
