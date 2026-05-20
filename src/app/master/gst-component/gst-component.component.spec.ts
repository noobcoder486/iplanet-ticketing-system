import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstComponentComponent } from './gst-component.component';

describe('GstComponentComponent', () => {
  let component: GstComponentComponent;
  let fixture: ComponentFixture<GstComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GstComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GstComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
