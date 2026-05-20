import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsMovementComponent } from './goods-movement.component';

describe('GoodsMovementComponent', () => {
  let component: GoodsMovementComponent;
  let fixture: ComponentFixture<GoodsMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsMovementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
