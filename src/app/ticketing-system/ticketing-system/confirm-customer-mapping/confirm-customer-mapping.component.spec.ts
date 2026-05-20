import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCustomerMappingComponent } from './confirm-customer-mapping.component';

describe('ConfirmCustomerMappingComponent', () => {
  let component: ConfirmCustomerMappingComponent;
  let fixture: ComponentFixture<ConfirmCustomerMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmCustomerMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCustomerMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
