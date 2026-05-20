import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLoginDashboardComponent } from './call-login-dashboard.component';

describe('CallLoginDashboardComponent', () => {
  let component: CallLoginDashboardComponent;
  let fixture: ComponentFixture<CallLoginDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallLoginDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallLoginDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
