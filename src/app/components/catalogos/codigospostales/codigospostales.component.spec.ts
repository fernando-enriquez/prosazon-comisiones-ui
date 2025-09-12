import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigospostalesComponent } from './codigospostales.component';

describe('CodigospostalesComponent', () => {
  let component: CodigospostalesComponent;
  let fixture: ComponentFixture<CodigospostalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodigospostalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodigospostalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
