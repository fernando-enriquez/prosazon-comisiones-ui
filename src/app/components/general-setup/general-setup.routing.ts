import { Routes } from "@angular/router";

import { GeneralSetupComponent } from './general-setup.component';
0
export const GeneralSetupRoutes: Routes = [
    {
      path: "",
      children: [
        {
          path: "",
          component: GeneralSetupComponent
        }
      ]
    }
  ];