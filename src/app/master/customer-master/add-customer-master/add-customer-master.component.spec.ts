import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomerMasterComponent } from './add-customer-master.component';

describe('AddCustomerMasterComponent', () => {
  let component: AddCustomerMasterComponent;
  let fixture: ComponentFixture<AddCustomerMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomerMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
