import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBackupResetPopupComponent } from './data-backup-reset-popup.component';

describe('DataBackupResetPopupComponent', () => {
  let component: DataBackupResetPopupComponent;
  let fixture: ComponentFixture<DataBackupResetPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataBackupResetPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataBackupResetPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
