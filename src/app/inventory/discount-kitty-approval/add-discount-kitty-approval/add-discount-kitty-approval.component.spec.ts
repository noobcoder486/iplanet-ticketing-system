import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiscountKittyApprovalComponent } from './add-discount-kitty-approval.component';

describe('AddDiscountKittyApprovalComponent', () => {
  let component: AddDiscountKittyApprovalComponent;
  let fixture: ComponentFixture<AddDiscountKittyApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDiscountKittyApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDiscountKittyApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
