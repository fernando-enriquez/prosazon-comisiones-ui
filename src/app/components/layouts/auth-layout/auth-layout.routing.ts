import { Routes } from "@angular/router";

import { LoginComponent } from "../../pages/login/login.component";
import { RecoveraccountComponent } from "../../pages/recoveraccount/recoveraccount.component";
import { ResetpasswordComponent } from "../../pages/resetpassword/resetpassword.component";

export const AuthLayoutRoutes: Routes = [
    {
        path: "",
        children: [
            {
                path: "login",
                component: LoginComponent
            },
            {
                path: "recoveraccount",
                component: RecoveraccountComponent
            },
            {
                path: "resetpassword/:token",
                component: ResetpasswordComponent
            }
        ]
    }
];
