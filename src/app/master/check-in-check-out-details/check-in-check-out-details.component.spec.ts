import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInCheckOutDetailsComponent } from './check-in-check-out-details.component';

describe('CheckInCheckOutDetailsComponent', () => {
  let component: CheckInCheckOutDetailsComponent;
  let fixture: ComponentFixture<CheckInCheckOutDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckInCheckOutDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInCheckOutDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
