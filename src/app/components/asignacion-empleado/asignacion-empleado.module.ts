import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsignacionEmpleadoComponent } from './asignacion-empleado.component';
import { RouterModule } from '@angular/router';
import { AsignacionEmpleadosRoutes } from './asignacion-empleado.routing';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    AsignacionEmpleadoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterModule.forChild(AsignacionEmpleadosRoutes),
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports:[AsignacionEmpleadoComponent]
})
export class AsignacionEmpleadoModule { }
