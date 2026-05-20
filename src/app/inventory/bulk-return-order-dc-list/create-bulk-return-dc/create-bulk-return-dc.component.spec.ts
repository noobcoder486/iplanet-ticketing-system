import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBulkReturnDcComponent } from './create-bulk-return-dc.component';

describe('CreateBulkReturnDcComponent', () => {
  let component: CreateBulkReturnDcComponent;
  let fixture: ComponentFixture<CreateBulkReturnDcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBulkReturnDcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBulkReturnDcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
