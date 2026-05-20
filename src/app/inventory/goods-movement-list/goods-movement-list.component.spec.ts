import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsMovementListComponent } from './goods-movement-list.component';

describe('GoodsMovementListComponent', () => {
  let component: GoodsMovementListComponent;
  let fixture: ComponentFixture<GoodsMovementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsMovementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsMovementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
