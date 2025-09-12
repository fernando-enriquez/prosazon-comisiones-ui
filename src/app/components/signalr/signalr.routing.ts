import { Routes } from "@angular/router";

import { SignalrComponent } from './signalr.component';

export const SignalrRoutes: Routes = [
    {
      path: "",
      children: [
        {
          path: "",
          component: SignalrComponent
        }
      ]
    }
  ];