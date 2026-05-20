import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProfileMasterComponent } from './add-profile-master.component';

describe('AddProfileMasterComponent', () => {
  let component: AddProfileMasterComponent;
  let fixture: ComponentFixture<AddProfileMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProfileMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProfileMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
