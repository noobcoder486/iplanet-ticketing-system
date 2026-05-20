import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDOAPopComponent } from './stock-doa-pop.component';

describe('StockDOAPopComponent', () => {
  let component: StockDOAPopComponent;
  let fixture: ComponentFixture<StockDOAPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockDOAPopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockDOAPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
