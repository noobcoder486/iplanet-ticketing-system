import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApproverSettingMasterComponent } from './add-approver-setting-master.component';

describe('AddApproverSettingMasterComponent', () => {
  let component: AddApproverSettingMasterComponent;
  let fixture: ComponentFixture<AddApproverSettingMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddApproverSettingMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddApproverSettingMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
