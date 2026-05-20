import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeOfPaymentPermissionComponent } from './mode-of-payment-permission.component';

describe('ModeOfPaymentPermissionComponent', () => {
  let component: ModeOfPaymentPermissionComponent;
  let fixture: ComponentFixture<ModeOfPaymentPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeOfPaymentPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeOfPaymentPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
