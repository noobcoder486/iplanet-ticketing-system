import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalationTrackerComponent } from './escalation-tracker.component';

describe('EscalationTrackerComponent', () => {
  let component: EscalationTrackerComponent;
  let fixture: ComponentFixture<EscalationTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EscalationTrackerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EscalationTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
