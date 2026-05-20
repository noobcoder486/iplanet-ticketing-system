import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAcknowledgeComponent } from './pending-acknowledge.component';

describe('PendingAcknowledgeComponent', () => {
  let component: PendingAcknowledgeComponent;
  let fixture: ComponentFixture<PendingAcknowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingAcknowledgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingAcknowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
