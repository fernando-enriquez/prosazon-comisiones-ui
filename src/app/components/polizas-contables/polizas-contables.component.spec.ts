import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizasContablesComponent } from './polizas-contables.component';

describe('PolizasContablesComponent', () => {
  let component: PolizasContablesComponent;
  let fixture: ComponentFixture<PolizasContablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolizasContablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolizasContablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
