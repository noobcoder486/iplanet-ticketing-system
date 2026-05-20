import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapGidComponent } from './map-gid.component';

describe('MapGidComponent', () => {
  let component: MapGidComponent;
  let fixture: ComponentFixture<MapGidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapGidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapGidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
