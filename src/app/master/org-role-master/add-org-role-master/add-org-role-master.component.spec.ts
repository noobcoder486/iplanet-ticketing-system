import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrgRoleMasterComponent } from './add-org-role-master.component';

describe('AddOrgRoleMasterComponent', () => {
  let component: AddOrgRoleMasterComponent;
  let fixture: ComponentFixture<AddOrgRoleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrgRoleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrgRoleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
