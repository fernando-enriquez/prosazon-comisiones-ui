import { Routes } from "@angular/router";

import { AsignacionEmpleadoComponent } from './asignacion-empleado.component';

export const AsignacionEmpleadosRoutes: Routes = [
    {
      path: "",
      children: [
        {
          path: "",
          component: AsignacionEmpleadoComponent
        }
      ]
    }
  ];