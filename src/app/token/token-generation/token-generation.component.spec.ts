import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenGenerationComponent } from './token-generation.component';

describe('TokenGenerationComponent', () => {
  let component: TokenGenerationComponent;
  let fixture: ComponentFixture<TokenGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenGenerationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
