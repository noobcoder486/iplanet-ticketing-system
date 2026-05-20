import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToStockPopComponent } from './convert-to-stock-pop.component';

describe('ConvertToStockPopComponent', () => {
  let component: ConvertToStockPopComponent;
  let fixture: ComponentFixture<ConvertToStockPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvertToStockPopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertToStockPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
