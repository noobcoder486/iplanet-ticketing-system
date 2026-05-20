import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalationTrackerListComponent } from './escalation-tracker-list.component';

describe('EscalationTrackerListComponent', () => {
  let component: EscalationTrackerListComponent;
  let fixture: ComponentFixture<EscalationTrackerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EscalationTrackerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EscalationTrackerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
