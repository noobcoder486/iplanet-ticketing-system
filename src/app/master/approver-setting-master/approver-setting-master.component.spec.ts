import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverSettingMasterComponent } from './approver-setting-master.component';

describe('ApproverSettingMasterComponent', () => {
  let component: ApproverSettingMasterComponent;
  let fixture: ComponentFixture<ApproverSettingMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproverSettingMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverSettingMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
