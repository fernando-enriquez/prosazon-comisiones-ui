import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlDespachosComponent } from './control-despachos.component';

describe('ControlDespachosComponent', () => {
  let component: ControlDespachosComponent;
  let fixture: ComponentFixture<ControlDespachosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlDespachosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlDespachosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
