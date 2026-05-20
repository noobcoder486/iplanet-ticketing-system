import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBulletinBoardComponent } from './add-bulletin-board.component';

describe('AddBulletinBoardComponent', () => {
  let component: AddBulletinBoardComponent;
  let fixture: ComponentFixture<AddBulletinBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBulletinBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBulletinBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
