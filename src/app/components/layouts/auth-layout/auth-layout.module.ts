import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthLayoutRoutes } from "./auth-layout.routing";

import { LoginComponent } from "../../pages/login/login.component";
import { RecoveraccountComponent } from "../../pages/recoveraccount/recoveraccount.component";
import { ResetpasswordComponent } from "../../pages/resetpassword/resetpassword.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    RecoveraccountComponent,
    ResetpasswordComponent
  ]
})
export class AuthLayoutModule {}
