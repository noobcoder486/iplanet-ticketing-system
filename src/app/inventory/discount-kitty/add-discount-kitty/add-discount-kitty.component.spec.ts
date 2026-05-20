import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiscountKittyComponent } from './add-discount-kitty.component';

describe('AddDiscountKittyComponent', () => {
  let component: AddDiscountKittyComponent;
  let fixture: ComponentFixture<AddDiscountKittyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDiscountKittyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDiscountKittyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
