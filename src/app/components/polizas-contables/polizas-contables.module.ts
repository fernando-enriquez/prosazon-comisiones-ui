import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PolizasContablesRoutes } from './polizas-contables.routing';
import { PolizasContablesComponent } from './polizas-contables.component';
import { DiarioComponent } from './modals/diario/diario.component';



@NgModule({
    declarations: [PolizasContablesComponent, DiarioComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(PolizasContablesRoutes),
        FormsModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        NgxSpinnerModule,
    ],
    exports: [PolizasContablesComponent]
})
export class PolizasContablesModule { }