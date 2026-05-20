import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnclaimedDeviceComponent } from './unclaimed-device.component';

describe('UnclaimedDeviceComponent', () => {
  let component: UnclaimedDeviceComponent;
  let fixture: ComponentFixture<UnclaimedDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnclaimedDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
