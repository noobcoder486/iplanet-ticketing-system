import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationGridComponent } from './reservation-grid.component';

describe('ReservationGridComponent', () => {
  let component: ReservationGridComponent;
  let fixture: ComponentFixture<ReservationGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
