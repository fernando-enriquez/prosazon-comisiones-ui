import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralSetupComponent } from './general-setup.component';
import { RouterModule } from '@angular/router';
import { GeneralSetupRoutes } from './general-setup.routing';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    GeneralSetupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(GeneralSetupRoutes),
  ],
  exports:[
    GeneralSetupComponent
  ]
})
export class GeneralSetupModule {

 
 }
