import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingInvoiceComponent } from './incoming-invoice.component';

describe('IncomingInvoiceComponent', () => {
  let component: IncomingInvoiceComponent;
  let fixture: ComponentFixture<IncomingInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomingInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
