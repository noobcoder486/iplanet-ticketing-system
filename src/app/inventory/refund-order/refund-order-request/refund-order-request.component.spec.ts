import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundOrderRequestComponent } from './refund-order-request.component';

describe('RefundOrderRequestComponent', () => {
  let component: RefundOrderRequestComponent;
  let fixture: ComponentFixture<RefundOrderRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundOrderRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundOrderRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
