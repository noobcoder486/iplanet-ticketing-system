import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProfileModuleMasterComponent } from './add-profile-module-master.component';

describe('AddProfileModuleMasterComponent', () => {
  let component: AddProfileModuleMasterComponent;
  let fixture: ComponentFixture<AddProfileModuleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProfileModuleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProfileModuleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
