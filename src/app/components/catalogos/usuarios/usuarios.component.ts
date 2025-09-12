import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import { PaginacionService } from "../../../services/paginacion.service";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { PeticionesService } from "../../../services/peticiones.service"
import { Subscription } from 'rxjs';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, OnDestroy {

  form = false; // Variable boolean para mostrar formulario usuario
  newU = false; // Variable boolean para mostrar formulario agregar usuario
  showU = false; // Variable boolean para mostrar formulario detalles usuario
  editU = false; // Variable boolean para mostrar formulario editar usuario
  typeppass = false; // Variable boolean para cambiar el tipo de contraseña e icono del input en formulario
  typepconfirmpass = false; // Variable boolean para cambiar el tipo de confirmar contraseña e icono del input en formulario

  /** Variables de formulario usuario*/
  username = null;
  nombres = null;
  apellidoPaterno = null;
  apellidoMaterno = null;
  fechaNacimiento: Date | null = null;
  celular: string | null = null;
  email = null;
  perfil = "";
  password = null;
  confirmpassword = null;

  celular1: string | null = null;
  idUsuario = null;

  usuarios: any; // Variable para asignar todos los registros de usuarios
  pages: any = {};  // Variable para asignar configuración de paginación
  users: any[] = []; // Variable para asignar registros de usuarios a mostrar en tabla por paginación
  allUsuarios: any[] = []; // Variable para asignar todos los registros de usuarios en arreglo
  perfiles: any; // Variable para asignar todos los registros de perfiles

  entries: number = 10; // Número de filas a mostrar en tabla responsables no visita

  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(private apinayarbotService: ApinayarbotService,
    private paginacion: PaginacionService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private router: Router,
    public peticionesService: PeticionesService,
    private localeService: BsLocaleService) {
    /** Configuración datepicker a español */
    defineLocale('es', esLocale)
    this.localeService.use('es');
  }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.usuariosT();
  }

  /**
   * Función obtener usuarios desde api service y visualizar en tabla usuarios
   */
  usuariosT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.usuariosT();
    });
    this.spinner.show();
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getUsuariosActivos().subscribe(
          (usuarios_result) => {
            this.usuarios = usuarios_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.usuarios.length > 0) {
              this.allUsuarios = this.usuarios;
              this.setPage(1);
            } else {
              this.allUsuarios = [];
              this.users = [];
            }
            this.spinner.hide();
          },
          (err) => {
            if (err.status != 401) {
              this.peticionesService.onCancelPendingRequests();
            }
            if (err.status === 500) {
              Swal.fire({
                icon: 'error',
                title: err.statusText,
                text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
                confirmButtonColor: '#5E72E4',
                iconColor: '#510A00',
              });
            } else if (err.status === 403) {
              Swal.fire({
                icon: 'info',
                title: 'Usuarios',
                text: err.error.errorMessages,
                confirmButtonColor: '#5E72E4',
                iconColor: '#5E72E4',
              });
            } else {
              console.log(err);
            }
            this.spinner.hide();
          }
        );
      },
      () => { }
    );
  }

  /**
   * Función obtener perfiles desde api service
   */
  perfilesGet() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.perfilesGet();
    });
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getPerfilesActivos().subscribe(
          (perfiles_result) => {
            this.perfiles = perfiles_result;
            this.peticionesService.onCancelPendingRequests();
          },
          (err) => {
            if (err.status != 401) {
              this.peticionesService.onCancelPendingRequests();
            }
            if (err.status === 500) {
              Swal.fire({
                icon: 'error',
                title: err.statusText,
                text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
                confirmButtonColor: '#5E72E4',
                iconColor: '#510A00',
              });
            } else if (err.status === 403) {
              Swal.fire({
                icon: 'info',
                title: 'Perfiles',
                text: err.error.errorMessages,
                confirmButtonColor: '#5E72E4',
                iconColor: '#5E72E4',
              });
            } else {
              console.log(err);
            }
          }
        );
      },
      () => { }
    );
  }

  /**
   * Función generar paginación de la tabla usuarios
   * @param {number} page Número de pagina a mostrar
   * @returns {void}
   */
  setPage(page: number) {
    if (this.usuarios.length > 0) {
      if (page < 1 || page > this.pages.totalPages) {
        return;
      }

      this.pages = this.paginacion.getPage(this.allUsuarios.length, page, this.entries);

      this.users = this.allUsuarios.slice(this.pages.startIndex, this.pages.endIndex + 1);
    }
  }

  /**
   * Función buscar valor en tabla usuarios
   * y mostrar solo registros que coinciden
   * @param {Event} event 
   */
  applyFilter(event: Event) {
    if (this.usuarios.length > 0) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.pages = {};
      this.allUsuarios = this.usuarios;
      var nuevo = this.allUsuarios;
      nuevo = nuevo.map(el => {
        if (el.username.trim().toLowerCase().includes(filterValue.trim().toLowerCase()) || el.perfil.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.apellidoPaterno != null) {
          if (el.apellidoPaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
        if (el.apellidoMaterno != null) {
          if (el.apellidoMaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
        if (el.nombres != null) {
          if (el.nombres.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
        if (el.email != null) {
          if (el.email.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
      }
      );
      this.allUsuarios = nuevo.filter(x => x != undefined);
      this.setPage(1);
    }
  }

  /**
   * Función mostrar formulario agregar usuario
   */
  nuevoUsuario() {
    this.close();
    this.perfilesGet();
    this.newU = true;
    this.form = true;
  }

  /**
   * Función mostrar formulario editar usuario
   * del registro index en tabla usuarios
   * @param {number} index Parametro indice del registro de tabla usuarios
   */
  editarUsuario(index: number) {
    this.verUsuario(index);
    this.editU = true;
    this.form = true;
  }

  /**
   * Función borrar usuario
   * del registro index en tabla usuarios
   * @param {number} index Parametro indice del registro de tabla usuarios
   */
  borrarUsuario(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'ELIMINAR USUARIO: ' + this.users[index].nombres,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'ELIMINAR USUARIO',
      cancelButtonText: 'CANCELAR',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUsuarios(index);
      }
    })
  }

  deleteUsuarios(index: number) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.deleteUsuarios(index);
    });
    const idUsuario = this.users[index].idUsuario;
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.deleteUsuarios(idUsuario);
      peticion.subscribe(
        (usuario_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire(
            'USUARIO ELIMINADO!',
            this.users[index].idUsuario,
            'success'
          )
          this.usuariosT();
          this.close();
        },
        (err) => {
          if (err.status != 401) {
            this.peticionesService.onCancelPendingRequests();
          }
          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: err.statusText,
              text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
              confirmButtonColor: '#5E72E4',
              iconColor: '#510A00',
            });
          } else if (err.status === 403) {
            Swal.fire({
              icon: 'info',
              title: 'Borrar usuario',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  /**
   * Función cargar datos al formulario usuario
   * del registro index en tabla usuarios
   * @param {number} index Parametro indice del registro de tabla usuarios
   */
  verUsuario(index: number) {
    this.close();
    this.perfilesGet();
    this.idUsuario = this.users[index].idUsuario;
    this.nombres = this.users[index].nombres;
    this.apellidoPaterno = this.users[index].apellidoPaterno;
    this.apellidoMaterno = this.users[index].apellidoMaterno;
    const cel = this.users[index].celular;
    if (cel != null) {
      if (cel.length != 0) {
        var cel1 = cel.slice(0, 3);
        var cel2 = cel.slice(3, 6);
        var cel3 = cel.slice(6, 10);
        this.celular = `(${cel1})-` + `${cel2}-` + `${cel3}`;
      } else {
        this.celular = cel;
      }
    } else {
      this.celular = cel;
    }
    this.email = this.users[index].email;
    this.perfil = this.users[index].idPerfil;
    this.password = this.users[index].password;
    this.confirmpassword = this.users[index].password;
    this.username = this.users[index].username;
    this.fechaNacimiento = this.users[index].fechaNacimiento;
  }

  /**
   * Función mostrar formulario detalles usuario
   * del registro index en tabla usuarios
   * @param {number} index Parametro indice del registro de tabla usuarios
   */
  detallesUsuario(index: number) {
    this.verUsuario(index);
    this.showU = true;
    this.form = true;
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla usuarios
   * @param $event 
   */
  entriesChange($event: any) {
    if (this.usuarios.length > 0) {
      if (parseInt($event.target.value) < 0) {

      } else {
        this.entries = parseInt($event.target.value);
        this.setPage(1);
      }
    }
  }

  /**
   * Función validación del formulario a guardar usuario.
   * @param {string} func Parametro para definir tipo de función a ejecutar 'new' o 'edit'
   */
  guardarUsuario(func: string) {
    (function () {
      'use strict'

      var forms = document.querySelectorAll('.validation')

      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.addEventListener('submit', function (event: any) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }
            form.classList.add('was-validated');
          }, false)
        })
    })()
    if (this.nombres === null || this.nombres === "" ||
      this.username === null || this.username === "" ||
      this.perfil === null || this.perfil === "" ||
      this.password === null || this.password === "" ||
      this.confirmpassword === null || this.confirmpassword === "" ||
      this.email === null || this.email === "") {
      return;
    } else if (this.password != this.confirmpassword) {
      Swal.fire({
        icon: 'warning',
        text: '¡CONTRASEÑAS NO COINCIDEN!',
        confirmButtonColor: '#5E72E4',
        iconColor: '#F6891E',
      });
      return;
    } else {
      if (this.apellidoPaterno === "") {
        this.apellidoPaterno = null;
      }
      if (this.apellidoMaterno === "") {
        this.apellidoMaterno = null;
      }
      if (this.celular === "") {
        this.celular = null;
      }
      if (this.celular != null) {
        var cel = "";
        cel = this.celular;
        var celn = cel.replace(/[()-]/g, '');
        const regex = /^[0-9]*$/;
        if (regex.test(celn)) {
          if (celn.length != 10) {
            Swal.fire({
              icon: 'warning',
              text: '¡INGRESAR NÚMERO DE CELULAR VÁLIDO!',
              confirmButtonColor: '#5E72E4',
              iconColor: '#F6891E',
            });
            return;
          } else {
            this.celular1 = celn;
          }
        } else {
          Swal.fire({
            icon: 'warning',
            text: '¡INGRESAR NÚMERO DE CELULAR VÁLIDO!',
            confirmButtonColor: '#5E72E4',
            iconColor: '#F6891E',
          });
          return;
        }
      } else if (this.celular === null) {
        this.celular1 = this.celular;
      } else {
        Swal.fire({
          icon: 'warning',
          text: '¡INGRESAR NÚMERO DE CELULAR VÁLIDO!',
          confirmButtonColor: '#5E72E4',
          iconColor: '#F6891E',
        });
        return;
      }
      if (func === 'edit') {
        this.updateUser();
      } else if (func === 'new') {
        this.createUser();
      }
    }
  }

  /**
   * Función inicializar variables cada que se cierra o cancela el formulario
   */
  close() {
    this.form = false;
    this.newU = false;
    this.showU = false;
    this.editU = false;
    this.typeppass = false;
    this.typepconfirmpass = false;

    this.nombres = null;
    this.apellidoPaterno = null;
    this.apellidoMaterno = null;
    this.fechaNacimiento = null;
    this.celular = null;
    this.email = null;
    this.perfil = "";
    this.username = null;
    this.password = null;
    this.confirmpassword = null;

    this.celular1 = null;
    this.idUsuario = null;
  }

  /**
   * Función modificar la estructura del input telefono (xxx)-xxx-xxxx
   * @param html 
   */
  verificarCel(html: any) {
    let textoActual;
    textoActual = html.celular;
    let textoAjustado;
    var tel = textoActual.replace(/[()-]/g, '');
    var cel1 = tel.slice(0, 3);
    var cel2 = tel.slice(3, 6);
    var cel3 = tel.slice(6, 10);
    if (tel.length === 0) {
      textoAjustado = null;
    } else if (tel.length < 3) {
      textoAjustado = `(${cel1}`
    } else if (tel.length < 6) {
      textoAjustado = `(${cel1})-` + `${cel2}`
    } else {
      textoAjustado = `(${cel1})-` + `${cel2}-` + `${cel3}`
    }
    html.celular = textoAjustado;
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

  /**
   * Función actualizar usuario desde api service y visualizar en tabla usuarios.
   */
  updateUser() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.updateUser();
    });
    const usuario = {
      "idUsuario": this.idUsuario,
      "nombres": this.nombres,
      "apellidoPaterno": this.apellidoPaterno,
      "apellidoMaterno": this.apellidoMaterno,
      "celular": this.celular1,
      "email": this.email,
      "password": this.password,
      "idPerfil": this.perfil,
      "username": this.username,
      "fechaNacimiento": this.fechaNacimiento
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.putUsuarios(usuario);
      peticion.subscribe(
        (usuario_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'USUARIO ACTUALIZADO',
            text: usuario_result,
            confirmButtonColor: '#5E72E4',
          });
          this.usuariosT();
          this.close();
        },
        (err) => {
          if (err.status != 401) {
            this.peticionesService.onCancelPendingRequests();
          }
          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: err.statusText,
              text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
              confirmButtonColor: '#5E72E4',
              iconColor: '#510A00',
            });
          } else if (err.status === 403) {
            Swal.fire({
              icon: 'info',
              title: 'Editar usuario',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  /**
   * Función crear usuario desde api service y visualizar en tabla usuarios.
   */
  createUser() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.createUser();
    });
    const usuario = {
      "nombres": this.nombres,
      "apellidoPaterno": this.apellidoPaterno,
      "apellidoMaterno": this.apellidoMaterno,
      "celular": this.celular1,
      "email": this.email,
      "password": this.password,
      "idPerfil": this.perfil,
      "username": this.username,
      "fechaNacimiento": this.fechaNacimiento
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postUsuarios(usuario);
      peticion.subscribe(
        (usuario_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'USUARIO REGISTRADO',
            text: usuario_result,
            confirmButtonColor: '#5E72E4',
          });
          this.usuariosT();
          this.close();
        },
        (err) => {
          if (err.status != 401) {
            this.peticionesService.onCancelPendingRequests();
          }
          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: err.statusText,
              text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
              confirmButtonColor: '#5E72E4',
              iconColor: '#510A00',
            });
          } else if (err.status === 403) {
            Swal.fire({
              icon: 'info',
              title: 'Agregar usuario',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  asignarModulos(index: number) {
    this.router.navigate(['/catalogos/modulospermisos/usuarios/' + this.users[index].idUsuario]);
  }

}
