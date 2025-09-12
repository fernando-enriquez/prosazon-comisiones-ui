import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiauthenticationService } from "../../../services/apiauthentication.service";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recoveraccount',
  templateUrl: './recoveraccount.component.html',
  styleUrls: ['./recoveraccount.component.scss']
})
export class RecoveraccountComponent implements OnInit {
  focus: any;
  focus1: any;
  
  button = false;
  recoverAccountForm: FormGroup;

  constructor(private router: Router, private apiauthenticationService: ApiauthenticationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.recoverAccountForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
    });
  }

  cancelar() {
    this.router.navigate(['principal/login']);
  }

  enviarEmail() {
    if (this.recoverAccountForm.valid) {      
      this.button = true;
      const email = {
        ...this.recoverAccountForm.value
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apiauthenticationService.postAuthenticationRecoverAccountEmail(email);
        peticion.subscribe(
          (email_result) => {
            if (email_result === true) {
              Swal.fire(
                'Recuperar tu cuenta',
                'CORREO ELECTRÓNICO ENVIADO!',
                'success'
              )
              this.router.navigate(['/login']);
            } else {
              Swal.fire({
                icon: 'warning',
                text: '¡Correo electrónico no pertenece a ninguna cuenta!',
                confirmButtonColor: '#5E72E4',
                iconColor: '#F6891E',
              });
              this.button = false;
            }
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
          }
        );
      });      
    } else {
      this.recoverAccountForm.markAllAsTouched();
    }
  }

}
