import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenReportComponent } from './token-report.component';

describe('TokenReportComponent', () => {
  let component: TokenReportComponent;
  let fixture: ComponentFixture<TokenReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
