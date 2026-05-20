import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAdvanceComponent } from './cancel-advance.component';

describe('CancelAdvanceComponent', () => {
  let component: CancelAdvanceComponent;
  let fixture: ComponentFixture<CancelAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelAdvanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
