import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserMasterComponent } from './add-user-master.component';

describe('AddUserMasterComponent', () => {
  let component: AddUserMasterComponent;
  let fixture: ComponentFixture<AddUserMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUserMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
