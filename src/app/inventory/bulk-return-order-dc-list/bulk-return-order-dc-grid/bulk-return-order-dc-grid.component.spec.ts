import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnOrderDcGridComponent } from './bulk-return-order-dc-grid.component';

describe('BulkReturnOrderDcGridComponent', () => {
  let component: BulkReturnOrderDcGridComponent;
  let fixture: ComponentFixture<BulkReturnOrderDcGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnOrderDcGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnOrderDcGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
