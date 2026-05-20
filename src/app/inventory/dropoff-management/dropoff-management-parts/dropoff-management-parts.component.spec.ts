import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropoffManagementPartsComponent } from './dropoff-management-parts.component';

describe('DropoffManagementPartsComponent', () => {
  let component: DropoffManagementPartsComponent;
  let fixture: ComponentFixture<DropoffManagementPartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropoffManagementPartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropoffManagementPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
