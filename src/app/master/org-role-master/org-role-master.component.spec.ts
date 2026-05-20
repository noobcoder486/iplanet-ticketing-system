import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgRoleMasterComponent } from './org-role-master.component';

describe('OrgRoleMasterComponent', () => {
  let component: OrgRoleMasterComponent;
  let fixture: ComponentFixture<OrgRoleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgRoleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgRoleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
