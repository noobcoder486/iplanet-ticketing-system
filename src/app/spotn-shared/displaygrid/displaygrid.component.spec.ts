import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaygridComponent } from './displaygrid.component';

describe('DisplaygridComponent', () => {
  let component: DisplaygridComponent;
  let fixture: ComponentFixture<DisplaygridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaygridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaygridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
