import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropoffManagementGridComponent } from './dropoff-management-grid.component';

describe('DropoffManagementGridComponent', () => {
  let component: DropoffManagementGridComponent;
  let fixture: ComponentFixture<DropoffManagementGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropoffManagementGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropoffManagementGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
