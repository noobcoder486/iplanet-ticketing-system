import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJobCustomerComponent } from './create-job-customer.component';

describe('CreateJobCustomerComponent', () => {
  let component: CreateJobCustomerComponent;
  let fixture: ComponentFixture<CreateJobCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateJobCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJobCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
