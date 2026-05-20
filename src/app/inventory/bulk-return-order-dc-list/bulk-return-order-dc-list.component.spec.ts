import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnOrderDcListComponent } from './bulk-return-order-dc-list.component';

describe('BulkReturnOrderDcListComponent', () => {
  let component: BulkReturnOrderDcListComponent;
  let fixture: ComponentFixture<BulkReturnOrderDcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnOrderDcListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnOrderDcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
