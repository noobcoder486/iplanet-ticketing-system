import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGstComponentComponent } from './add-gst-component.component';

describe('AddGstComponentComponent', () => {
  let component: AddGstComponentComponent;
  let fixture: ComponentFixture<AddGstComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGstComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGstComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
