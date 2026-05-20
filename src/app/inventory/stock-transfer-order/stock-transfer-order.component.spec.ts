import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransferOrderComponent } from './stock-transfer-order.component';

describe('StockTransferOrderComponent', () => {
  let component: StockTransferOrderComponent;
  let fixture: ComponentFixture<StockTransferOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockTransferOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTransferOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
