import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormChildGridComponent } from './form-child-grid.component';

describe('FormChildGridComponent', () => {
  let component: FormChildGridComponent;
  let fixture: ComponentFixture<FormChildGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormChildGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormChildGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
