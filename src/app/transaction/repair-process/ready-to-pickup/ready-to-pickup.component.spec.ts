import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyToPickupComponent } from './ready-to-pickup.component';

describe('ReadyToPickupComponent', () => {
  let component: ReadyToPickupComponent;
  let fixture: ComponentFixture<ReadyToPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadyToPickupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadyToPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
