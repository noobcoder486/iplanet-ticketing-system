import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketingSystemComponent } from './ticketing-system.component';

describe('TicketingSystemComponent', () => {
  let component: TicketingSystemComponent;
  let fixture: ComponentFixture<TicketingSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketingSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketingSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
