import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDetailsPanelComponent } from './header-details-panel.component';

describe('HeaderDetailsPanelComponent', () => {
  let component: HeaderDetailsPanelComponent;
  let fixture: ComponentFixture<HeaderDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderDetailsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
