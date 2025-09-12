import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import { PaginacionService } from "../../../services/paginacion.service";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { PeticionesService } from "../../../services/peticiones.service"
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.scss']
})
export class PerfilesComponent implements OnInit, OnDestroy {

  perfiles: any; // Variable para asignar todos los registros de perfiles
  pages: any = {};  // Variable para asignar configuración de paginación
  profiles: any[] = []; // Variable para asignar registros de perfiles a mostrar en tabla por paginación
  allPerfiles: any[] = []; // Variable para asignar todos los registros de perfiles en arreglo

  entries: number = 10; // Número de filas a mostrar en tabla perfiles

  form = false; // Variable boolean para mostrar formulario perfil
  newP = false; // Variable boolean para mostrar formulario agregar perfil
  showP = false; // Variable boolean para mostrar formulario detalles perfil
  editP = false; // Variable boolean para mostrar formulario editar perfil

  /** Variables de formulario perfil*/
  idPerfil = null;
  nombre = null;
  descripcion = null;

  private _subscriptionPeticion: Subscription;

  constructor(private apinayarbotService: ApinayarbotService, private paginacion: PaginacionService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router, public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.perfilesT();
  }

  /**
  * Función obtener perfiles desde api service y visualizar en tabla perfiles
  */
  perfilesT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.perfilesT();
    });
    this.spinner.show();
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getPerfilesActivos().subscribe(
          (perfiles_result) => {
            this.perfiles = perfiles_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.perfiles.length > 0) {
              this.allPerfiles = this.perfiles;
              this.setPage(1);
            } else {
              this.allPerfiles = [];
              this.profiles = [];
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
                title: 'Perfiles',
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
  * Función generar paginación de la tabla perfiles
  * @param {number} page Número de pagina a mostrar
  * @returns {void}
  */
  setPage(page: number) {
    if (this.perfiles.length > 0) {
      if (page < 1 || page > this.pages.totalPages) {
        return;
      }

      this.pages = this.paginacion.getPage(this.allPerfiles.length, page, this.entries);

      this.profiles = this.allPerfiles.slice(this.pages.startIndex, this.pages.endIndex + 1);
    }
  }

  /**
   * Función buscar valor en tabla perfiles
   * y mostrar solo registros que coinciden
   * @param {Event} event 
   */
  applyFilter(event: Event) {
    if (this.perfiles.length > 0) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.pages = {};
      this.allPerfiles = this.perfiles;
      var nuevo = this.allPerfiles;
      nuevo = nuevo.map(el => {
        if (el.idPerfil.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.nombre.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.descripcion != null) {
          if (el.descripcion.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
      }
      );
      this.allPerfiles = nuevo.filter(x => x != undefined);
      this.setPage(1);
    }
  }

  /**
   * Función mostrar formulario agregar perfil
   */
  nuevoPerfil() {
    this.close();
    this.newP = true;
    this.form = true;
  }

  /**
   * Función mostrar formulario editar perfil
   * del registro index en tabla perfiles
   * @param {number} index Parametro indice del registro de tabla perfiles
   */
  editarPerfil(index: number) {
    this.verPerfil(index);
    this.editP = true;
    this.form = true;
  }

  /**
   * Función borrar perfil
   * del registro index en tabla perfiles
   * @param {number} index Parametro indice del registro de tabla perfiles
   */
  borrarPerfil(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'ELIMINAR PERFIL: ' + this.profiles[index].idPerfil,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'ELIMINAR PERFIL',
      cancelButtonText: 'CANCELAR',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePerfiles(index);
      }
    })
  }

  deletePerfiles(index: number) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.deletePerfiles(index);
    });
    const idPerfil = this.profiles[index].idPerfil;
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.deletePerfiles(idPerfil);
      peticion.subscribe(
        (perfil_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire(
            'PERFIL ELIMINADO!',
            this.profiles[index].idPerfil,
            'success'
          )
          this.perfilesT();
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
              title: 'Borrar perfil',
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
   * Función cargar datos al formulario perfil
   * del registro index en tabla perfiles
   * @param {number} index Parametro indice del registro de tabla perfiles
   */
  verPerfil(index: number) {
    this.close();
    this.idPerfil = this.profiles[index].idPerfil;
    this.nombre = this.profiles[index].nombre;
    this.descripcion = this.profiles[index].descripcion;
  }

  /**
   * Función mostrar formulario detalles perfil
   * del registro index en tabla perfiles
   * @param {number} index Parametro indice del registro de tabla perfiles
   */
  detallesPerfil(index: number) {
    this.verPerfil(index);
    this.showP = true;
    this.form = true;
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla perfiles
   * @param $event 
   */
  entriesChange($event: any) {
    if (this.perfiles.length > 0) {
      if (parseInt($event.target.value) < 0) {

      } else {
        this.entries = parseInt($event.target.value);
        this.setPage(1);
      }
    }
  }

  asignarModulos(index: number) {
    this.router.navigate(['/catalogos/modulospermisos/perfiles/' + this.profiles[index].idPerfil]);
  }

  /**
   * Función inicializar variables cada que se cierra o cancela el formulario
   */
  close() {
    this.form = false;
    this.newP = false;
    this.showP = false;
    this.editP = false;

    this.idPerfil = null;
    this.nombre = null;
    this.descripcion = null;
  }

  /**
   * Función validación del formulario a guardar perfil.
   * @param {string} func Parametro para definir tipo de función a ejecutar 'new' o 'edit'
   */
  guardarPerfil(func: string) {
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
            form.classList.add('was-validated')
          }, false)
        })
    })()
    if (this.idPerfil === null || this.idPerfil === "" ||
      this.nombre === null || this.nombre === 'null') {
      return;
    } else {
      if (this.descripcion === "") {
        this.descripcion = null;
      }
      if (func === 'edit') {
        this.updatePerfil();
      } else if (func === 'new') {
        this.createPerfil();
      }
    }
  }

  /**
   * Función actualizar perfil desde api service y visualizar en tabla perfiles.
   */
  updatePerfil() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.updatePerfil();
    });
    const perfil = {
      "idPerfil": this.idPerfil,
      "nombre": this.nombre,
      "descripcion": this.descripcion
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.putPerfiles(perfil);
      peticion.subscribe(
        (perfil_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'PERFIL ACTUALIZADO',
            text: perfil_result,
            confirmButtonColor: '#5E72E4',
          });
          this.perfilesT();
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
              title: 'Editar perfil',
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
   * Función crear perfil desde api service y visualizar en tabla perfiles.
   */
  createPerfil() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.createPerfil();
    });
    const perfil = {
      "idPerfil": this.idPerfil,
      "nombre": this.nombre,
      "descripcion": this.descripcion
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postPerfiles(perfil);
      peticion.subscribe(
        (perfil_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'PERFIL REGISTRADO',
            text: perfil_result,
            confirmButtonColor: '#5E72E4',
          });
          this.perfilesT();
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
              title: 'Agregar perfil',
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
}
