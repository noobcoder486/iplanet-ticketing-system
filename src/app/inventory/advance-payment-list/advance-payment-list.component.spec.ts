import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentListComponent } from './advance-payment-list.component';

describe('AdvancePaymentListComponent', () => {
  let component: AdvancePaymentListComponent;
  let fixture: ComponentFixture<AdvancePaymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancePaymentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancePaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
