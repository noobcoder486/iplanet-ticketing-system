import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignmentPendingListComponent } from './consignment-pending-list.component';

describe('ConsignmentPendingListComponent', () => {
  let component: ConsignmentPendingListComponent;
  let fixture: ComponentFixture<ConsignmentPendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsignmentPendingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignmentPendingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
