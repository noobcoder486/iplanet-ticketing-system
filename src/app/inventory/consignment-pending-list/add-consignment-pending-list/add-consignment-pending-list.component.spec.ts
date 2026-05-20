import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsignmentPendingListComponent } from './add-consignment-pending-list.component';

describe('AddConsignmentPendingListComponent', () => {
  let component: AddConsignmentPendingListComponent;
  let fixture: ComponentFixture<AddConsignmentPendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConsignmentPendingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConsignmentPendingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
