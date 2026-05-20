import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocationMasterComponent } from './add-location-master.component';

describe('AddLocationMasterComponent', () => {
  let component: AddLocationMasterComponent;
  let fixture: ComponentFixture<AddLocationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLocationMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
