import { Routes } from "@angular/router";

import { ListaNegraComponent } from './lista-negra.component';

export const ListaNegraRoutes: Routes = [
    {
      path: "",
      children: [
        {
          path: "",
          component: ListaNegraComponent
        }
      ]
    }
  ];