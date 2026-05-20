import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountKittyComponent } from './discount-kitty.component';

describe('DiscountKittyComponent', () => {
  let component: DiscountKittyComponent;
  let fixture: ComponentFixture<DiscountKittyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountKittyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountKittyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
