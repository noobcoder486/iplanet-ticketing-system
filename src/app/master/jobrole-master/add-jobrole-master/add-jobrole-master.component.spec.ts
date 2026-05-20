import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobroleMasterComponent } from './add-jobrole-master.component';

describe('AddJobroleMasterComponent', () => {
  let component: AddJobroleMasterComponent;
  let fixture: ComponentFixture<AddJobroleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddJobroleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddJobroleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
