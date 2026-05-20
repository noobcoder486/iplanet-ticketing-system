import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessorySalesListComponent } from './accessory-sales-list.component';

describe('AccessorySalesListComponent', () => {
  let component: AccessorySalesListComponent;
  let fixture: ComponentFixture<AccessorySalesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessorySalesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessorySalesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
