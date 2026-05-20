import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingInvoiceListComponent } from './incoming-invoice-list.component';

describe('IncomingInvoiceListComponent', () => {
  let component: IncomingInvoiceListComponent;
  let fixture: ComponentFixture<IncomingInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomingInvoiceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
