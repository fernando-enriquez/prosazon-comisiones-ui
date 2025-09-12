import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ControlDespachosRoutes } from './control-despachos.routing';
import { ControlDespachosComponent } from './control-despachos.component';



@NgModule({
    declarations: [ControlDespachosComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(ControlDespachosRoutes),
        FormsModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        NgxSpinnerModule,
    ],
    exports: [ControlDespachosComponent]
})
export class ControlDespachosModule { }