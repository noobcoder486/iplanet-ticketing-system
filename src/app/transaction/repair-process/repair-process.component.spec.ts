import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairProcessComponent } from './repair-process.component';

describe('RepairProcessComponent', () => {
  let component: RepairProcessComponent;
  let fixture: ComponentFixture<RepairProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
