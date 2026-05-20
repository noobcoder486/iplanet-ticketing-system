import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLoginGridComponent } from './call-login-grid.component';

describe('CallLoginGridComponent', () => {
  let component: CallLoginGridComponent;
  let fixture: ComponentFixture<CallLoginGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallLoginGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallLoginGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
