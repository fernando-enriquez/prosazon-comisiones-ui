import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NorthwareUtilsService } from 'src/app/services/northwareUtils.service';
import { PeticionesService } from 'src/app/services/peticiones.service';
import Swal from 'sweetalert2';
import { DiarioComponent } from './modals/diario/diario.component';

@Component({
  selector: 'app-polizas-contables',
  templateUrl: './polizas-contables.component.html',
  styleUrls: ['./polizas-contables.component.scss']
})
export class PolizasContablesComponent implements OnInit, OnDestroy {

  listaRegistros: any; // Variable para asignar todos los registros
  pages: any = {};  // Variable para asignar configuración de paginación
  listaRegistrosTabla: any[] = []; // Variable para asignar registros a mostrar en tabla por paginación
  allRegistros: any[] = []; // Variable para asignar todos los registros
  entries: number = 10; // Número de filas a mostrar en tabla
  cantidadRegistros: number;

  filter = {
    page: 1,
    limit: 25,
    search: "",
    fechaInicio: "",
    fechaFin: "",
    fields: ['Sentencia Favorable', 'desvirtuado', 'definitivo', 'presunto']
  };

  lastUpdate: string;

  public subscriber: Subscription;
  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(private spinner: NgxSpinnerService,
    private northwareUtilsService: NorthwareUtilsService,
    private route: ActivatedRoute,
    public peticionesService: PeticionesService,
    private modalService: NgbModal) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.obtenerRegistros();
  }

  async obtenerRegistros(onViewMore = false, page: number = 1): Promise<void> {
    try {
      if (onViewMore) {
        this.filter.page = page;
      } else {
        this.filter.page = 1;
      }

      this.filter.limit = this.entries;
      this.spinner.show();
      this.route.paramMap.subscribe(
        (params) => {
          this.northwareUtilsService.getProveedores(this.filter).subscribe(
            (proveedores) => {
              this.listaRegistrosTabla = proveedores["data"];
              let pagesCount = Math.ceil(proveedores["totalCount"] / this.entries);
              this.cantidadRegistros = proveedores["totalCount"];

              try {
                // Fecha en formato UTC
                var fechaUTC = new Date(proveedores["lastUpdate"]);

                // Obtén el desplazamiento horario en minutos para GMT-6
                var desplazamientoGMT6 = -6 * 60;

                // Aplica el desplazamiento horario a la fecha
                fechaUTC.setMinutes(fechaUTC.getMinutes() + desplazamientoGMT6);

                // Obtén los componentes de la fecha
                var dia = fechaUTC.getUTCDate();
                var mes = fechaUTC.getUTCMonth() + 1; // Los meses comienzan desde 0, así que sumamos 1
                var año = fechaUTC.getUTCFullYear();
                var hora = fechaUTC.getUTCHours();
                var minuto = fechaUTC.getUTCMinutes();

                // Formatea la fecha y hora en el formato deseado
                var fechaFormateada = `${dia}/${mes}/${año} ${hora}:${minuto}`;

                this.lastUpdate = fechaFormateada;
              }
              catch (ex) {

              }

              this.pages.totalPages = pagesCount;

              this.pages.pages = [];
              for (var i = 0; i < pagesCount; i++) {
                this.pages.pages.push(i + 1);
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

    } catch (e) {
      this.spinner.hide();
    }
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla
   * @param $event 
   */
  entriesChange($event: any) {
    this.entries = parseInt($event.target.value);
    this.setPage(1);
  }

  /**
   * Función generar paginación de la tabla
   * @param {number} page Número de pagina a mostrar
   * @returns {void}
   */
  setPage(page: number) {
    page = page == 0 ? 1 : page;
    this.obtenerRegistros(true, page);
  }

  resetearRegistros() {
    this.filter.fechaFin = "";
    this.filter.fechaInicio = "";
    this.filter.search = "";
    this.obtenerRegistros();
  }

  diario(registro: any) {
    const modalRef = this.modalService.open(DiarioComponent, { centered: true, backdrop: 'static', size: 'xl' });
    modalRef.componentInstance.poliza = registro;
  }
}
