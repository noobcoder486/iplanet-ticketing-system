import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallManagementListComponent } from './call-management-list.component';

describe('CallManagementListComponent', () => {
  let component: CallManagementListComponent;
  let fixture: ComponentFixture<CallManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
