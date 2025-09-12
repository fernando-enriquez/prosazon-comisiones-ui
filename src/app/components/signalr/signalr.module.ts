import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SignalrComponent } from "./signalr.component";

import { RouterModule } from "@angular/router";
import { SignalrRoutes } from "./signalr.routing";

@NgModule({
  declarations: [SignalrComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(SignalrRoutes)
  ],
  exports: [SignalrComponent]
})
export class SignalrModule {}