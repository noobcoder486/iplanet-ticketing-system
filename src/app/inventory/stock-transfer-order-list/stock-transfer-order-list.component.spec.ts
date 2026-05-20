import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransferOrderListComponent } from './stock-transfer-order-list.component';

describe('StockTransferOrderListComponent', () => {
  let component: StockTransferOrderListComponent;
  let fixture: ComponentFixture<StockTransferOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockTransferOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTransferOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
