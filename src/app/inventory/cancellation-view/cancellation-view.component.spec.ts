import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationViewComponent } from './cancellation-view.component';

describe('CancellationViewComponent', () => {
  let component: CancellationViewComponent;
  let fixture: ComponentFixture<CancellationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancellationViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancellationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
