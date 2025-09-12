import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiauthenticationService } from "../../../services/apiauthentication.service";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  focus: any;
  focus1: any;
  typeppass = false; // Variable boolean para cambiar el tipo de contraseña e icono del input en formulario
  typepconfirmpass = false; // Variable boolean para cambiar el tipo de confirmar contraseña e icono del input en formulario
  token: any; // Variable para asignar el token de la url

  button = false;
  resertPasswordForm: FormGroup;

  tokenValid: any;
  public user: any;

  constructor(private route: ActivatedRoute, private router: Router, private apiauthenticationService: ApiauthenticationService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    const token = {
      "token": this.token
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apiauthenticationService.postAuthenticationRecoverAccountTokenValidation(token);
      peticion.subscribe(
        (token_result) => {
          if (!token_result.idTokenRecovery) {
            this.cancelar();
          } else {
            this.tokenValid = token_result;
          }
        },
        (err) => {
          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: err.statusText,
              text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
              confirmButtonColor: '#5E72E4',
              iconColor: '#510A00',
            });
          } else {
            console.log(err);
          }
          this.cancelar();
        }
      );
    });
    this.resertPasswordForm = new FormGroup({
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required])
    });
  }

  /**
  * Función cambiar variables typeppass y typepconfirmpass a valor contrario actual
  * dependiendo del parametro.
  * @param {number} num Parametro valor 0 identifica input contraseña y valor 1 identifica input confirmar contraseña
  */
  passwordFunc(num: number) {
    if (num === 0) {
      this.typeppass = !this.typeppass;
    }
    if (num === 1) {
      this.typepconfirmpass = !this.typepconfirmpass;
    }
  }

  cancelar() {
    this.router.navigate(['principal/login']);
  }

  restablecerPassword() {
    if (this.resertPasswordForm.valid) {
      this.button = true;
      if (this.resertPasswordForm.value.password != this.resertPasswordForm.value.passwordConfirm) {
        Swal.fire({
          icon: 'warning',
          text: '¡CONTRASEÑAS NO COINCIDEN!',
          confirmButtonColor: '#5E72E4',
          iconColor: '#F6891E',
        });
        this.button = false;
        return;
      }

      const recoveraccountPassword = {
        "idUsuario": this.tokenValid.idUsuario,
        "password": this.resertPasswordForm.value.password,
        "idTokenRecovery": this.tokenValid.idTokenRecovery
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apiauthenticationService.postAuthenticationRecoverAccountPassword(recoveraccountPassword);
        peticion.subscribe(
          (login_result) => {
            console.log(login_result);
            this.route.paramMap.subscribe((params) => {
              let peticion: Observable<any>;
              peticion = this.apiauthenticationService.postAuthenticationLogin(login_result);
              peticion.subscribe(
                (login_result) => {
                  this.user = login_result;
                  const accessToken = this.user.accessToken;
                  const refreshToken = this.user.refreshToken;
                  this.apiauthenticationService.guardarToken(accessToken, refreshToken);
                  this.apiauthenticationService.leerToken();
                  this.router.navigate(['/dashboard']);
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
                    console.log(err);
                  }
                  this.cancelar();
                }
              );
            });
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
              console.log(err);
            }
            this.cancelar();
          }
        );
      });
    } else {
      this.resertPasswordForm.markAllAsTouched();
    }
  }
}
