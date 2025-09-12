import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginacionService } from "../../../services/paginacion.service";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from 'rxjs';
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HorariosComponent } from './horarios/horarios.component';
import { PeticionesService } from "../../../services/peticiones.service"
import { Observable } from 'rxjs';
import { ParametrosComponent } from './parametros/parametros/parametros.component';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss']
})
export class RutasComponent implements OnInit, OnDestroy {

  rutas: any; // Variable para asignar todos los registros de rutas
  pages: any = {}; // Variable para asignar configuración de paginación
  rutass: any[] = []; // Variable para asignar registros a mostrar de rutas en tabla por paginación
  allRutas: any[] = []; // Variable para asignar todos los registros de rutas en arreglo

  entries: number = 10; // Número de filas a mostrar en tabla rutas

  private _subscriptionPeticion: Subscription = new Subscription();

  form = false; // Variable boolean para mostrar formulario ruta

  /** Variables de formulario ruta*/
  ruta = null;
  tipoRuta = null;
  responsable = null;
  cedis = null;

  formAsignarCP = false;

  rutacp: any; // Variable para asignar todos los códigos postales de ruta 
  cp: any; // Variable para asignar todos los registros de códigos postales no asignados de ruta
  cpasignados: any; // Variable para asignar todos los registros de códigos postales asignados de ruta

  cps = new Set<string>(); // Variable para asignar registros de códigos postales a mostrar en tabla códigos postales
  cpAsignadoss = new Set<string>(); // Variable para asignar registros de códigos postales asignados a mostrar en tabla códigos postales asignados
  cpAsignadossFilter = new Set<string>(); // Variable para asignar registros de tabla códigos postales asigndos
  cpNoAsignadossFilter = new Set<string>(); // Variable para asignar registros de tabla códigos postales no asigndos
  clickedRowsCP = new Set<string>(); // Variable para asignar registros seleccionados de tabla códigos postales
  clickedRowsCPA = new Set<string>(); // Variable para asignar registros seleccionados de tabla códigos postales asignados

  buscarCP = false;
  buscarCPA = false;

  constructor(private paginacion: PaginacionService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private apinayarbotService: ApinayarbotService,
    private modalService: NgbModal,
    public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.rutasT();
  }

  /**
   * Función obtener rutas desde api service y visualizar en tabla
   */
  rutasT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.rutasT();
    });
    this.spinner.show();
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getRutas().subscribe(
          (rutas_result) => {
            this.rutas = rutas_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.rutas.length > 0) {
              this.allRutas = this.rutas;
              this.setPage(1);
            } else {
              this.allRutas = [];
              this.rutass = [];
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
   * Función generar paginación de la tabla rutas
   * @param {number} page Número de pagina a mostrar
   * @returns {void}
   */
  setPage(page: number) {
    if (this.rutas.length > 0) {
      if (page < 1 || page > this.pages.totalPages) {
        return;
      }

      this.pages = this.paginacion.getPage(this.allRutas.length, page, this.entries);

      this.rutass = this.allRutas.slice(this.pages.startIndex, this.pages.endIndex + 1);
    }
  }

  /**
   * Función buscar valor en tabla rutas
   * y mostrar solo registros que coinciden
   * @param {Event} event 
   */
  applyFilter(event: Event) {
    if (this.rutas.length > 0) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.pages = {};
      this.allRutas = this.rutas;
      var nuevo = this.allRutas;
      nuevo = nuevo.map(el => {
        if (el.ruta.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.tipoRuta != null) {
          if (el.tipoRuta.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
        if (el.responsable != null) {
          if (el.responsable.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
        if (el.cedis != null) {
          if (el.cedis.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            return el;
          }
        }
      }
      );
      this.allRutas = nuevo.filter(x => x != undefined);
      this.setPage(1);
    }
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla rutas
   * @param $event 
   */
  entriesChange($event: any) {
    if (this.rutas.length > 0) {
      if (parseInt($event.target.value) < 0) {

      } else {
        this.entries = parseInt($event.target.value);
        this.setPage(1);
      }
    }
  }

  /**
   * Función mostrar y cargar datos al formulario asignar códigos postales
   * del registro index en tabla rutas
   * @param {number} index Parametro indice del registro de tabla rutas
   */
  asignarCP(index: number) {
    this.close();
    this.ruta = this.rutass[index].ruta;
    this.cpGet();
    this.formAsignarCP = true;
  }

  horarios(index: number) {
    const modalRef = this.modalService.open(HorariosComponent, { centered: true, scrollable: true, backdrop: 'static', size: 'lg', windowClass: "modal-xlg" });
    const objRuta = this.rutass[index];
    modalRef.componentInstance.RutaInput = objRuta;
  }

  parametros(index: number) {
    const modalRef = this.modalService.open(ParametrosComponent, { centered: true, scrollable: true, backdrop: 'static', size: 'lg' });
    const objRuta = this.rutass[index];
    modalRef.componentInstance.RutaInput = objRuta;
  }

  /**
   * Función mostrar formulario detalles ruta
   * @param {number} index Parametro indice del registro de tabla rutas
   */
  detallesRuta(index: number) {
    this.close();
    this.ruta = this.rutass[index].ruta;
    this.tipoRuta = this.rutass[index].tipoRuta;
    this.responsable = this.rutass[index].responsable;
    this.cedis = this.rutass[index].cedis;
    this.form = true;
  }

  /**
   * Función inicializar variables cada que se cierra o cancela el formulario
   */
  close() {
    this.form = false;
    this.ruta = null;
    this.tipoRuta = null;
    this.responsable = null;
    this.cedis = null;

    this.formAsignarCP = false;

    this.rutacp = null;
    this.cp = null;
    this.cps.clear();
    this.cpAsignadoss.clear();
    this.cpAsignadossFilter.clear();
    this.cpNoAsignadossFilter.clear();
    this.clickedRowsCP.clear();
    this.clickedRowsCPA.clear();

    this.buscarCP = false;
    this.buscarCPA = false;
  }

  /**
 * Función obtener códigos postales asignados y no asignados de ruta
 * desde apinayarbot service
 */
  cpGet() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.cpGet();
    });
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getRutasCPAsignados(this.ruta).subscribe(
          (cp_result) => {
            this.rutacp = cp_result;
            this.peticionesService.onCancelPendingRequests();
            this.cpasignados = this.rutacp.asignados;
            if (this.cpasignados.length > 0) {
              for (let index = 0; index < this.cpasignados.length; index++) {
                this.cpAsignadoss.add(this.cpasignados[index]);
                this.cpAsignadossFilter.add(this.cpasignados[index]);
              }
            }
            this.cp = this.rutacp.noAsignados;
            if (this.cp.length > 0) {
              for (let index = 0; index < this.cp.length; index++) {
                this.cps.add(this.cp[index]);
                this.cpNoAsignadossFilter.add(this.cp[index]);
              }
            }
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
      },
      () => { }
    );
  }

  /**
   * Función filtro de busqueda en la tabla códigos postales
   * @param event 
  */
  applyFilterCP(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarCP = false;
    } else {
      this.buscarCP = true;
    }
    this.cps.clear();
    if (this.cpNoAsignadossFilter.size != 0) {
      this.cpNoAsignadossFilter.forEach(element => {
        this.cps.add(element);
      });
    }

    let nuevo = new Set<string>();
    if (this.cps.size != 0) {
      this.cps.forEach(element => {
        if (element != null) {
          if (element.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.cps.clear();
      nuevo.forEach(element => {
        this.cps.add(element);
      });
    } else {
      this.cps.clear();
    }
  }

  /**
  * Función filtro de busqueda en la tabla códigos postales asignados
  * @param event 
 */
  applyFilterCPA(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarCPA = false;
    } else {
      this.buscarCPA = true;
    }
    this.cpAsignadoss.clear();
    if (this.cpAsignadossFilter.size != 0) {
      this.cpAsignadossFilter.forEach(element => {
        this.cpAsignadoss.add(element);
      });
    }

    let nuevo = new Set<string>();
    if (this.cpAsignadoss.size != 0) {
      this.cpAsignadoss.forEach(element => {
        if (element != null) {
          if (element.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.cpAsignadoss.clear();
      nuevo.forEach(element => {
        this.cpAsignadoss.add(element);
      });
    } else {
      this.cpAsignadoss.clear();
    }
  }

  /**
 * Función agregar o quitar registro seleccionado con el evento click
 * de tabla códigos postales al conjunto clickedRowsCP
 * @param {string} row Parametro registro de la tabla códigos postales evento click
 */
  clickedRowsLCP(row: string) {
    let eliminar = 0;
    this.clickedRowsCP.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsCP.delete(row);
    } else {
      this.clickedRowsCP.add(row);
    }
  }

  /**
* Función agregar o quitar registro seleccionado con el evento click
* de tabla códigos postales asignados al conjunto clickedRowsCPA
* @param {string} row Parametro registro de la tabla códigos postales asignados evento click
*/
  clickedRowsLCPA(row: string) {
    let eliminar = 0;
    this.clickedRowsCPA.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsCPA.delete(row);
    } else {
      this.clickedRowsCPA.add(row);
    }
  }

  /**
* Función agregar todos los registros de tabla colonias a tabla códigos postales asignados
*/
  allright() {
    if (this.buscarCP || this.buscarCPA) {
      this.cps.forEach(element => {
        this.cpAsignadoss.add(element);
        this.cpAsignadossFilter.add(element);
      });
      this.clickedRowsCP.clear();

      if (this.cpNoAsignadossFilter.size != 0) {
        this.cps.forEach(element => {
          this.cpNoAsignadossFilter.delete(element);
        });
      }
      this.cps.clear();
    } else {
      this.cps.forEach(element => {
        this.cpAsignadoss.add(element)
        this.cpAsignadossFilter.add(element);
      });
      this.clickedRowsCP.clear();
      this.cps.clear();
      this.cpNoAsignadossFilter.clear();
    }
  }

  /**
   * Función quitar todos los registros de tabla códigos postales asignados
   */
  allleft() {
    if (this.buscarCPA || this.buscarCP) {
      this.cpAsignadoss.forEach(element => {
        this.cps.add(element);
        this.cpNoAsignadossFilter.add(element);
      });
      this.clickedRowsCPA.clear();

      if (this.cpAsignadossFilter.size != 0) {
        this.cpAsignadoss.forEach(element => {
          this.cpAsignadossFilter.delete(element);
        });
      }
      this.cpAsignadoss.clear();
    } else {
      this.cpAsignadoss.forEach(element => {
        this.cps.add(element);
        this.cpNoAsignadossFilter.add(element);
      });
      this.cpAsignadoss.clear();
      this.cpAsignadossFilter.clear();
      this.clickedRowsCPA.clear();
    }
  }

  /**
  * Función agregar uno o varios registros seleccionados de tabla códigos postales
  * a tabla códigos postales asignados
  */
  multipleright() {
    this.clickedRowsCP.forEach(element => {
      this.cpAsignadoss.add(element);
      this.cpAsignadossFilter.add(element);
      this.cps.delete(element);
      this.cpNoAsignadossFilter.delete(element);
    });
    this.clickedRowsCP.clear();
  }

  /**
 * Función quitar uno o varios registros seleccionados de tabla códigos postales asignados
 */
  multipleleft() {
    this.clickedRowsCPA.forEach(element => {
      this.cpAsignadoss.delete(element);
      this.cpAsignadossFilter.delete(element);
      this.cps.add(element);
      this.cpNoAsignadossFilter.add(element);
    });
    this.clickedRowsCPA.clear();
  }

  /**
  * Función crear códigos postales asignados de ruta desde api service.
  */
  guardarAsignarCP() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.guardarAsignarCP();
    });
    let ar = Array.from(this.cpAsignadoss);
    const codigosPostalesRuta = {
      "ruta": this.ruta,
      "cp": ar
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postRutasAsignarCP(codigosPostalesRuta);
      peticion.subscribe(
        (supervisores_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'CÓDIGOS POSTALES GUARDADOS',
            text: supervisores_result,
            confirmButtonColor: '#5E72E4',
          });
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
