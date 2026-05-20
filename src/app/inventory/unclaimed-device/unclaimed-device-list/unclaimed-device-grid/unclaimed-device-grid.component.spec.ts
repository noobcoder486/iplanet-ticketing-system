import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnclaimedDeviceGridComponent } from './unclaimed-device-grid.component';

describe('UnclaimedDeviceGridComponent', () => {
  let component: UnclaimedDeviceGridComponent;
  let fixture: ComponentFixture<UnclaimedDeviceGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnclaimedDeviceGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedDeviceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
