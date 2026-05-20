import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileModuleMasterComponent } from './profile-module-master.component';

describe('ProfileModuleMasterComponent', () => {
  let component: ProfileModuleMasterComponent;
  let fixture: ComponentFixture<ProfileModuleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileModuleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileModuleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
