import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketingBulkQuotationComponent } from './ticketing-bulk-quotation.component';

describe('TicketingBulkQuotationComponent', () => {
  let component: TicketingBulkQuotationComponent;
  let fixture: ComponentFixture<TicketingBulkQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketingBulkQuotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketingBulkQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
