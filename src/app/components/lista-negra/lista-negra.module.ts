import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaNegraComponent } from './lista-negra.component';
import { RouterModule } from '@angular/router';
import { ListaNegraRoutes } from './lista-negra.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { IconPickerModule } from 'ngx-icon-picker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';



@NgModule({
  declarations: [ListaNegraComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(ListaNegraRoutes),
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgxSpinnerModule,
    MatTreeModule,
    MatTableModule,
    IconPickerModule,
    NgxMaterialTimepickerModule,
    MatFormFieldModule,
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports:[ListaNegraComponent]
})
export class ListaNegraModule { }
