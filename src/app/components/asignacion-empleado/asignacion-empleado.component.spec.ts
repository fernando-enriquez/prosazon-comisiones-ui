import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionEmpleadoComponent } from './asignacion-empleado.component';

describe('AsignacionEmpleadoComponent', () => {
  let component: AsignacionEmpleadoComponent;
  let fixture: ComponentFixture<AsignacionEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionEmpleadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
