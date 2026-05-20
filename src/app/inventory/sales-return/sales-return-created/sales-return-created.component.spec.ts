import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnCreatedComponent } from './sales-return-created.component';

describe('SalesReturnCreatedComponent', () => {
  let component: SalesReturnCreatedComponent;
  let fixture: ComponentFixture<SalesReturnCreatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesReturnCreatedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesReturnCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
