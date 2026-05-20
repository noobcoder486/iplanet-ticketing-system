import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToteManagementComponent } from './add-tote-management.component';

describe('AddToteManagementComponent', () => {
  let component: AddToteManagementComponent;
  let fixture: ComponentFixture<AddToteManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddToteManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToteManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
