import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountKittyApprovalComponent } from './discount-kitty-approval.component';

describe('DiscountKittyApprovalComponent', () => {
  let component: DiscountKittyApprovalComponent;
  let fixture: ComponentFixture<DiscountKittyApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountKittyApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountKittyApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
