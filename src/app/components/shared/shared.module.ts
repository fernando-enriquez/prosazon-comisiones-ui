import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { FormsModule } from "@angular/forms";
import { TagInputModule } from "ngx-chips";
import { NgxSpinnerModule } from "ngx-spinner";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";

import { RouterModule } from "@angular/router";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CollapseModule.forRoot(),
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FormsModule,
    TagInputModule,
    NgxSpinnerModule
  ],
  declarations: [
    SidebarComponent,
    NavbarComponent,
    FooterComponent
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    FooterComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule {}
