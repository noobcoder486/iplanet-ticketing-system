import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropoffManagementComponent } from './dropoff-management.component';

describe('DropoffManagementComponent', () => {
  let component: DropoffManagementComponent;
  let fixture: ComponentFixture<DropoffManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropoffManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropoffManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
