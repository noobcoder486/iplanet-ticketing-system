import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignmentLockdateLogsComponent } from './consignment-lockdate-logs.component';

describe('ConsignmentLockdateLogsComponent', () => {
  let component: ConsignmentLockdateLogsComponent;
  let fixture: ComponentFixture<ConsignmentLockdateLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsignmentLockdateLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignmentLockdateLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
