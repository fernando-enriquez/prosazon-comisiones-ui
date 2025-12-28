import { Routes } from "@angular/router";

import { ListaAsistenciaComponent } from './lista-asistencia.component';

export const ListaAsistenciaRoutes: Routes = [
    {
      path: "",
      children: [
        {
          path: "",
          component: ListaAsistenciaComponent
        }
      ]
    }
  ];