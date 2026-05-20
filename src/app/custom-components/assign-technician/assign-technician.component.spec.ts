import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTechnicianComponent } from './assign-technician.component';

describe('AssignTechnicianComponent', () => {
  let component: AssignTechnicianComponent;
  let fixture: ComponentFixture<AssignTechnicianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTechnicianComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTechnicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
