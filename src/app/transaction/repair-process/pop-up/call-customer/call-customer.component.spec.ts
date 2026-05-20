import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallCustomerComponent } from './call-customer.component';

describe('CallCustomerComponent', () => {
  let component: CallCustomerComponent;
  let fixture: ComponentFixture<CallCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
