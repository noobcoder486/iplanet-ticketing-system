import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadManagementListComponent } from './lead-management-list.component';

describe('LeadManagementListComponent', () => {
  let component: LeadManagementListComponent;
  let fixture: ComponentFixture<LeadManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
