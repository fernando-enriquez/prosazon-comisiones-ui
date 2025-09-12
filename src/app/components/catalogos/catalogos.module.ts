import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxSpinnerModule } from "ngx-spinner";
import { MatTreeModule } from '@angular/material/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { IconPickerModule } from 'ngx-icon-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";

import { RutasComponent } from './rutas/rutas.component';
import { CodigospostalesComponent } from './codigospostales/codigospostales.component';
import { MotivosnoentregaComponent } from './motivosnoentrega/motivosnoentrega.component';
import { HorariosComponent } from './rutas/horarios/horarios.component';
import { EditarHorarioComponent } from './rutas/horarios/editar-horario/editar-horario.component';
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { PerfilesComponent } from "./perfiles/perfiles.component";
import { ModulosComponent } from "./modulos/modulos.component";
import { ModulospermisosComponent } from './modulospermisos/modulospermisos.component';
import { AsignarusuariospermisosmodalComponent } from './modulospermisos/asignarusuariospermisosmodal/asignarusuariospermisosmodal.component';

import { RouterModule } from "@angular/router";
import { CatalogosRoutes } from "./catalogos.routing";
import { ParametrosComponent } from './rutas/parametros/parametros/parametros.component';

@NgModule({
  declarations: [
    RutasComponent,
    CodigospostalesComponent,
    MotivosnoentregaComponent,
    HorariosComponent,
    EditarHorarioComponent,
    UsuariosComponent,
    PerfilesComponent,
    ModulosComponent,
    ModulospermisosComponent,
    AsignarusuariospermisosmodalComponent,
    ParametrosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CatalogosRoutes),
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgxSpinnerModule,
    MatTreeModule,
    MatTableModule,
    IconPickerModule,
    NgxMaterialTimepickerModule,
    MatFormFieldModule,
    BsDatepickerModule.forRoot()
  ]
})
export class CatalogosModule { }
