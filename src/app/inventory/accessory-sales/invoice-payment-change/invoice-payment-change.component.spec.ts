import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePaymentChangeComponent } from './invoice-payment-change.component';

describe('InvoicePaymentChangeComponent', () => {
  let component: InvoicePaymentChangeComponent;
  let fixture: ComponentFixture<InvoicePaymentChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePaymentChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePaymentChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
