import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningStockListComponent } from './opening-stock-list.component';

describe('OpeningStockListComponent', () => {
  let component: OpeningStockListComponent;
  let fixture: ComponentFixture<OpeningStockListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpeningStockListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningStockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
