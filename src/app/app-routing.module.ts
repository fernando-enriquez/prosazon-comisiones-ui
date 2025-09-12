import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

import { AuthjwtGuardService } from './services/guards/authjwt-guard.service';

import { AdminLayoutComponent } from "./components/layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./components/layouts/auth-layout/auth-layout.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "lista-asistencia",
        loadChildren: () => import('./components/lista-negra/lista-negra.module').then(m => m.ListaNegraModule)
      },
      {
        path: "asignacion-empleado",
        loadChildren: () => import('./components/asignacion-empleado/asignacion-empleado.module').then(m => m.AsignacionEmpleadoModule)
      },
      {
        path: "configuracion",
        loadChildren: () => import('./components/general-setup/general-setup.module').then(m => m.GeneralSetupModule)
      }
    ],
    canActivate: [AuthjwtGuardService]
  },
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () => import('./components/layouts/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule)
      }
    ]
  },
  {
    path: "**",
    redirectTo: "login"
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
