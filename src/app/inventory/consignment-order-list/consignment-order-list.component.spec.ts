import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignmentOrderListComponent } from './consignment-order-list.component';

describe('ConsignmentOrderListComponent', () => {
  let component: ConsignmentOrderListComponent;
  let fixture: ComponentFixture<ConsignmentOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsignmentOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignmentOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
