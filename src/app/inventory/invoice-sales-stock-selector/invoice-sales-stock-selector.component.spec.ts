import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSalesStockSelectorComponent } from './invoice-sales-stock-selector.component';

describe('InvoiceSalesStockSelectorComponent', () => {
  let component: InvoiceSalesStockSelectorComponent;
  let fixture: ComponentFixture<InvoiceSalesStockSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceSalesStockSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSalesStockSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
