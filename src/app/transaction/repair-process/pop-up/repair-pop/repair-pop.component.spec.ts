import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairPopComponent } from './repair-pop.component';

describe('RepairPopComponent', () => {
  let component: RepairPopComponent;
  let fixture: ComponentFixture<RepairPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairPopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
