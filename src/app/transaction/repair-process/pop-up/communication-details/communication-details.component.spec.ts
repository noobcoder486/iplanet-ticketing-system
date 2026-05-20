import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationDetailsComponent } from './communication-details.component';

describe('CommunicationDetailsComponent', () => {
  let component: CommunicationDetailsComponent;
  let fixture: ComponentFixture<CommunicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
