import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropoffManagementListComponent } from './dropoff-management-list.component';

describe('DropoffManagementListComponent', () => {
  let component: DropoffManagementListComponent;
  let fixture: ComponentFixture<DropoffManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropoffManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropoffManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
