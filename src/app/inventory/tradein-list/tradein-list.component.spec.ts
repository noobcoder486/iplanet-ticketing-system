import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeinListComponent } from './tradein-list.component';

describe('TradeinListComponent', () => {
  let component: TradeinListComponent;
  let fixture: ComponentFixture<TradeinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeinListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
