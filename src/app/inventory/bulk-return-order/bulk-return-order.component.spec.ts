import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnOrderComponent } from './bulk-return-order.component';

describe('BulkReturnOrderComponent', () => {
  let component: BulkReturnOrderComponent;
  let fixture: ComponentFixture<BulkReturnOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
