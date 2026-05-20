import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGstGroupComponent } from './add-gst-group.component';

describe('AddGstGroupComponent', () => {
  let component: AddGstGroupComponent;
  let fixture: ComponentFixture<AddGstGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGstGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGstGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
