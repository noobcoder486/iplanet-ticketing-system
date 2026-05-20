import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadOnArrivalPopComponent } from './dead-on-arrival-pop.component';

describe('DeadOnArrivalPopComponent', () => {
  let component: DeadOnArrivalPopComponent;
  let fixture: ComponentFixture<DeadOnArrivalPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeadOnArrivalPopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeadOnArrivalPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
