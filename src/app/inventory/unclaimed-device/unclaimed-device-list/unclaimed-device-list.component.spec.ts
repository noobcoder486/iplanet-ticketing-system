import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnclaimedDeviceListComponent } from './unclaimed-device-list.component';

describe('UnclaimedDeviceListComponent', () => {
  let component: UnclaimedDeviceListComponent;
  let fixture: ComponentFixture<UnclaimedDeviceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnclaimedDeviceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedDeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
