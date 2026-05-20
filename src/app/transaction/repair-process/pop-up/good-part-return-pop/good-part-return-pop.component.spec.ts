import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodPartReturnPopComponent } from './good-part-return-pop.component';

describe('GoodPartReturnPopComponent', () => {
  let component: GoodPartReturnPopComponent;
  let fixture: ComponentFixture<GoodPartReturnPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodPartReturnPopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodPartReturnPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
