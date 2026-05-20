import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnRequestComponent } from './sales-return-request.component';

describe('SalesReturnRequestComponent', () => {
  let component: SalesReturnRequestComponent;
  let fixture: ComponentFixture<SalesReturnRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesReturnRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesReturnRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
