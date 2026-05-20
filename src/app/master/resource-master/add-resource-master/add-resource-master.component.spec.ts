import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResourceMasterComponent } from './add-resource-master.component';

describe('AddResourceMasterComponent', () => {
  let component: AddResourceMasterComponent;
  let fixture: ComponentFixture<AddResourceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddResourceMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResourceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
