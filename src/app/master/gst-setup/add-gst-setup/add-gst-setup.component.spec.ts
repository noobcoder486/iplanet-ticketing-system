import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGstSetupComponent } from './add-gst-setup.component';

describe('AddGstSetupComponent', () => {
  let component: AddGstSetupComponent;
  let fixture: ComponentFixture<AddGstSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGstSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGstSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
