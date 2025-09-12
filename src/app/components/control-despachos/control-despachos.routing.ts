import { Routes } from "@angular/router";

import { ControlDespachosComponent } from './control-despachos.component';

export const ControlDespachosRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: ControlDespachosComponent
      }
    ]
  }
];