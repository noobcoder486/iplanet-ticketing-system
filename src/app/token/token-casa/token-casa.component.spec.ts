import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenCasaComponent } from './token-casa.component';

describe('TokenCasaComponent', () => {
  let component: TokenCasaComponent;
  let fixture: ComponentFixture<TokenCasaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenCasaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
