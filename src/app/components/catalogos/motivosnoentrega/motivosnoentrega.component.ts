import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginacionService } from "../../../services/paginacion.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute } from "@angular/router";
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { PeticionesService } from "../../../services/peticiones.service"
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motivosnoentrega',
  templateUrl: './motivosnoentrega.component.html',
  styleUrls: ['./motivosnoentrega.component.scss']
})
export class MotivosnoentregaComponent implements OnInit, OnDestroy {

  form = false; // Variable boolean para mostrar formulario motivo no entrega
  newMNE = false; // Variable boolean para mostrar formulario agregar motivo no entrega
  showMNE = false; // Variable boolean para mostrar formulario detalles motivo no entrega
  editMNE = false; // Variable boolean para mostrar formulario editar motivo no entrega

  /** Variables de formulario motivo no entrega*/
  motivo = null;
  descripcion = null;
  icono = ' ';

  cveMotivoNoEntrega = null;

  motivosnoentrega: any; // Variable para asignar todos los registros de motivos no entrega
  pages: any = {};  // Variable para asignar configuración de paginación
  motivosnoentregaa: any[] = []; // Variable para asignar registros de motivos no entrega a mostrar en tabla por paginación
  allMotivosnoentrega: any[] = []; // Variable para asignar todos los registros de motivos no entrega en arreglo

  entries: number = 10; // Número de filas a mostrar en tabla responsables no visita

  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(private paginacion: PaginacionService, private spinner: NgxSpinnerService, private apinayarbotService: ApinayarbotService, private route: ActivatedRoute, public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.mneT();
  }

  /**
   * Función obtener motivos no entrega desde api service y visualizar en tabla motivos no entrega
   */
  mneT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.mneT();
    });
    this.spinner.show();
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getMotivosNoEntrega().subscribe(
          (mne_result) => {
            this.motivosnoentrega = mne_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.motivosnoentrega.length > 0) {
              this.allMotivosnoentrega = this.motivosnoentrega;
              this.setPage(1);
            } else {
              this.allMotivosnoentrega = [];
              this.motivosnoentregaa = [];
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
   * Función generar paginación de la tabla motivos no entrega
   * @param {number} page Número de pagina a mostrar
   * @returns {void}
   */
  setPage(page: number) {
    if (this.motivosnoentrega.length > 0) {
      if (page < 1 || page > this.pages.totalPages) {
        return;
      }

      this.pages = this.paginacion.getPage(this.allMotivosnoentrega.length, page, this.entries);

      this.motivosnoentregaa = this.allMotivosnoentrega.slice(this.pages.startIndex, this.pages.endIndex + 1);
    }
  }

  /**
   * Función buscar valor en tabla motivos no entrega
   * y mostrar solo registros que coinciden
   * @param {Event} event 
   */
  applyFilter(event: Event) {
    if (this.motivosnoentrega.length > 0) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.pages = {};
      this.allMotivosnoentrega = this.motivosnoentrega;
      var nuevo = this.allMotivosnoentrega;
      nuevo = nuevo.map(el => {
        if (el.motivo.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.descripcion != null) {
          if (el.descripcion.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
      }
      );
      this.allMotivosnoentrega = nuevo.filter(x => x != undefined);
      this.setPage(1);
    }
  }

  /**
 * Función mostrar formulario agregar motivo no entrega
 */
  nuevoMNE() {
    this.close();
    this.newMNE = true;
    this.form = true;
  }

  /**
   * Función mostrar formulario editar motivo no entrega
   * del registro index en tabla motivos no entrega
   * @param {number} index Parametro indice del registro de tabla motivos no entrega
   */
  editarMNE(index: number) {
    this.verMNE(index);
    this.editMNE = true;
    this.form = true;
  }

  /**
   * Función borrar motivo no entrega
   * del registro index en tabla motivos no entrega
   * @param {number} index Parametro indice del registro de tabla motivos no entrega
   */
  borrarMNE(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'ELIMINAR MOTIVO NO ENTREGA: ' + this.motivosnoentregaa[index].motivo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'ELIMINAR MOTIVO NO ENTREGA',
      cancelButtonText: 'CANCELAR',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteMNE(index);
      }
    })
  }

  deleteMNE(index: number) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.deleteMNE(index);
    });
    const idMNE = this.motivosnoentregaa[index].cveMotivoNoEntrega;
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.deleteMotivosNoEntrega(idMNE);
      peticion.subscribe(
        (mne_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire(
            'MOTIVO NO ENTREGA ELIMINADO!',
            this.motivosnoentregaa[index].cveMotivoNoEntrega,
            'success'
          )
          this.mneT();
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
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  /**
   * Función cargar datos al formulario motivo no entrega
   * del registro index en tabla motivos no entrega
   * @param {number} index Parametro indice del registro de tabla motivos no entrega
   */
  verMNE(index: number) {
    this.close();
    this.motivo = this.motivosnoentregaa[index].motivo;
    this.descripcion = this.motivosnoentregaa[index].descripcion;
    if (this.motivosnoentregaa[index].icon === null) {
      this.icono = ' ';
    } else {
      this.icono = this.motivosnoentregaa[index].icon;
    }
    this.cveMotivoNoEntrega = this.motivosnoentregaa[index].cveMotivoNoEntrega;
  }

  /**
   * Función mostrar formulario detalles motivo no entrega
   * del registro index en tabla motivos no entrega
   * @param {number} index Parametro indice del registro de tabla motivos no entrega
   */
  detallesMNE(index: number) {
    this.verMNE(index);
    this.showMNE = true;
    this.form = true;
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla motivos no entrega
   * @param $event 
   */
  entriesChange($event: any) {
    if (this.motivosnoentrega.length > 0) {
      if (parseInt($event.target.value) < 0) {

      } else {
        this.entries = parseInt($event.target.value);
        this.setPage(1);
      }
    }
  }

  /**
     * Función inicializar variables cada que se cierra o cancela el formulario
     */
  close() {
    this.form = false;
    this.newMNE = false;
    this.showMNE = false;
    this.editMNE = false;

    this.motivo = null;
    this.descripcion = null;
    this.icono = ' ';
    this.cveMotivoNoEntrega = null;
  }

  /**
   * Función validación del formulario a guardar motivo no entrega.
   * @param {string} func Parametro para definir tipo de función a ejecutar 'new' o 'edit'
   */
  guardarMNE(func: string) {
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
    if (this.motivo === null || this.motivo === "") {
      return;
    } else {
      if (this.descripcion === "") {
        this.descripcion = null;
      }
      if (func === 'edit') {
        this.updateMNE();
      } else if (func === 'new') {
        this.createMNE();
      }
    }
  }

  /**
   * Función para guardar icono seleccionado para visualizar en formulario.
   * @param $event 
   */
  onIconPickerSelect($event: any) {
    this.icono = $event;
  }

  /**
   * Función crear motivo no entrega desde api service y visualizar en tabla motivos no entrega.
   */
  createMNE() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.createMNE();
    });
    let icon;
    if (this.icono === " " || this.icono === "") {
      icon = null;
    } else {
      icon = this.icono;
    }
    const motivonoentrega = {
      "motivo": this.motivo,
      "descripcion": this.descripcion,
      "icon": icon
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postMotivosNoEntrega(motivonoentrega);
      peticion.subscribe(
        (motivonoentrega_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'MOTIVO NO ENTREGA REGISTRADO',
            text: motivonoentrega_result,
            confirmButtonColor: '#5E72E4',
          });
          this.mneT();
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
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  /**
 * Función actualizar motivo no entrega desde api service y visualizar en tabla motivos no entrega.
 */
  updateMNE() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.updateMNE();
    });
    let icon;
    if (this.icono === " " || this.icono === "") {
      icon = null;
    } else {
      icon = this.icono;
    }
    const motivonoentrega = {
      "cveMotivoNoEntrega": this.cveMotivoNoEntrega,
      "motivo": this.motivo,
      "descripcion": this.descripcion,
      "icon": icon
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.putMotivosNoEntrega(motivonoentrega);
      peticion.subscribe(
        (motivonoentrega_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'MOTIVO NO ENTREGA ACTUALIZADO',
            text: motivonoentrega_result,
            confirmButtonColor: '#5E72E4',
          });
          this.mneT();
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
          } else {
            console.log(err);
          }
        }
      );
    });
  }
}
