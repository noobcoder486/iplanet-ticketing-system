import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeinComponent } from './tradein.component';

describe('TradeinComponent', () => {
  let component: TradeinComponent;
  let fixture: ComponentFixture<TradeinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
