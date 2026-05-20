import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstGroupComponent } from './gst-group.component';

describe('GstGroupComponent', () => {
  let component: GstGroupComponent;
  let fixture: ComponentFixture<GstGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GstGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GstGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
