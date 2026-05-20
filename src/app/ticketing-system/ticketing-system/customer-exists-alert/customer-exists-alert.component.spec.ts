import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerExistsAlertComponent } from './customer-exists-alert.component';

describe('CustomerExistsAlertComponent', () => {
  let component: CustomerExistsAlertComponent;
  let fixture: ComponentFixture<CustomerExistsAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerExistsAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerExistsAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
