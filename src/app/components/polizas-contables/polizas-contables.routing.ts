import { Routes } from "@angular/router";

import { PolizasContablesComponent } from './polizas-contables.component';

export const PolizasContablesRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: PolizasContablesComponent
      }
    ]
  }
];