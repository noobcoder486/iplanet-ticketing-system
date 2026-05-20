import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountApproverComponent } from './discount-approver.component';

describe('DiscountApproverComponent', () => {
  let component: DiscountApproverComponent;
  let fixture: ComponentFixture<DiscountApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountApproverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
