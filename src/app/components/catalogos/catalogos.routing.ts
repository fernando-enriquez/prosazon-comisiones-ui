import { Routes } from "@angular/router";

import { RutasComponent } from './rutas/rutas.component';
import { CodigospostalesComponent } from './codigospostales/codigospostales.component';
import { MotivosnoentregaComponent } from './motivosnoentrega/motivosnoentrega.component';
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { PerfilesComponent } from "./perfiles/perfiles.component";
import { ModulosComponent } from "./modulos/modulos.component";
import { ModulospermisosComponent } from './modulospermisos/modulospermisos.component';

export const CatalogosRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "rutas",
        component: RutasComponent
      },
      {
        path: "codigospostales",
        component: CodigospostalesComponent
      },
      {
        path: "motivosnoentrega",
        component: MotivosnoentregaComponent
      },
      {
        path: "usuarios",
        component: UsuariosComponent
      },
      {
        path: "perfiles",
        component: PerfilesComponent
      },
      {
        path: "modulos",
        component: ModulosComponent
      },
      {
        path: "modulospermisos/:tipo/:id",
        component: ModulospermisosComponent
      },
    ]
  }
];