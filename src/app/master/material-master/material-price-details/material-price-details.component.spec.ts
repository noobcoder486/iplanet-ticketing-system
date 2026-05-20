import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialPriceDetailsComponent } from './material-price-details.component';

describe('MaterialPriceDetailsComponent', () => {
  let component: MaterialPriceDetailsComponent;
  let fixture: ComponentFixture<MaterialPriceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialPriceDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialPriceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
