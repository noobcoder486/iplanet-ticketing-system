import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessorySalesComponent } from './accessory-sales.component';

describe('AccessorySalesComponent', () => {
  let component: AccessorySalesComponent;
  let fixture: ComponentFixture<AccessorySalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessorySalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessorySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
