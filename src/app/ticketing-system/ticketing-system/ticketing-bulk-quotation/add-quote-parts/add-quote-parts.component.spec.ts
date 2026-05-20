import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuotePartsComponent } from './add-quote-parts.component';

describe('AddQuotePartsComponent', () => {
  let component: AddQuotePartsComponent;
  let fixture: ComponentFixture<AddQuotePartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddQuotePartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQuotePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
