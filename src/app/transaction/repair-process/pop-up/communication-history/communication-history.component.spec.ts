import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationHistoryComponent } from './communication-history.component';

describe('CommunicationHistoryComponent', () => {
  let component: CommunicationHistoryComponent;
  let fixture: ComponentFixture<CommunicationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
