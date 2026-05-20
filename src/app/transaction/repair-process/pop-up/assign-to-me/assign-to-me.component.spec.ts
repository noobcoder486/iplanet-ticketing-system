import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToMeComponent } from './assign-to-me.component';

describe('AssignToMeComponent', () => {
  let component: AssignToMeComponent;
  let fixture: ComponentFixture<AssignToMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignToMeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignToMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
