import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundPopupComponent } from './refund-popup.component';

describe('RefundPopupComponent', () => {
  let component: RefundPopupComponent;
  let fixture: ComponentFixture<RefundPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
