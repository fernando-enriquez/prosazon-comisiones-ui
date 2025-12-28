import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AdminLayoutComponent } from "./components/layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./components/layouts/auth-layout/auth-layout.component";
import { SharedModule } from "./components/shared/shared.module";
import { ToastrModule } from 'ngx-toastr';
import { JwtInterceptorService } from './services/interceptors/jwt-interceptor.service';

import {
  MsalModule,
  MsalService,
  MsalGuard,
  MsalInterceptor
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    AdminLayoutComponent,
  ],
  
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: 'b8ea74fe-d7ff-434a-8bf3-9557001dcd80',
          authority: 'https://login.microsoftonline.com/1667dc1e-cbe9-458f-be80-7a82fa18ac93',
          redirectUri: 'http://localhost:4200'
        }
      }),
      {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['User.Read']
        }
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map()
      }
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
