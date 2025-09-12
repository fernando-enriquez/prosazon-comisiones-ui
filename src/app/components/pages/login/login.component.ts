import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { ApiauthenticationService } from "../../../services/apiauthentication.service";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  focus: any;
  focus1: any;

  button = false;
  loginForm: FormGroup;

  public user: any;

  constructor(private router: Router, private apiauthenticationService: ApiauthenticationService, private route: ActivatedRoute) { }

  ngOnInit() { 
     let token = this.apiauthenticationService.leerToken();
     if(token != ""){
      this.router.navigate(['/lista-asistencia']);
     }

    this.loginForm = new FormGroup({
      username: new FormControl(null, [Validators.required]), 
      password: new FormControl(null, [Validators.required])
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.button = true;
      const userLogin = {
        ...this.loginForm.value
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apiauthenticationService.postAuthenticationLogin(userLogin);
        peticion.subscribe(
          (login_result) => {
            this.user = login_result;
            console.log();
            const accessToken = this.user.access_token;
            // const refreshToken = this.user.refreshToken;
            const refreshToken = "";
            this.apiauthenticationService.guardarToken(accessToken, refreshToken);
            this.apiauthenticationService.leerToken();
            this.router.navigate(['/lista-asistencia']);
          },
          (err) => {
            this.button = false;
            if (err.status === 500) {
              Swal.fire({
                icon: 'error',
                title: err.statusText,
                text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
                confirmButtonColor: '#5E72E4',
                iconColor: '#510A00',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: err.statusText,
                text: 'USUARIO NO EXISTE, VERIFICA EMAIL Y CONTRASEÑA SEAN CORRECTOS',
                confirmButtonColor: '#5E72E4',
                iconColor: '#510A00',
              });
            }
          }
        );
      });      
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  recoveraccount() {
    this.router.navigate(['principal/recoveraccount']);
  }
}
