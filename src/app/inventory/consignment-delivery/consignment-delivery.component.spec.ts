import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignmentDeliveryComponent } from './consignment-delivery.component';

describe('ConsignmentDeliveryComponent', () => {
  let component: ConsignmentDeliveryComponent;
  let fixture: ComponentFixture<ConsignmentDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsignmentDeliveryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignmentDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
