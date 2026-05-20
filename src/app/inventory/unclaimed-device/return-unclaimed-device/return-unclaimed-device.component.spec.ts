import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnUnclaimedDeviceComponent } from './return-unclaimed-device.component';

describe('ReturnUnclaimedDeviceComponent', () => {
  let component: ReturnUnclaimedDeviceComponent;
  let fixture: ComponentFixture<ReturnUnclaimedDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReturnUnclaimedDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnUnclaimedDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
