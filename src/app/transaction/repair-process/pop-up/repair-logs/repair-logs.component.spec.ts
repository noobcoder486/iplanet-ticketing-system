import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairLogsComponent } from './repair-logs.component';

describe('RepaiLogsComponent', () => {
  let component: RepairLogsComponent;
  let fixture: ComponentFixture<RepairLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
