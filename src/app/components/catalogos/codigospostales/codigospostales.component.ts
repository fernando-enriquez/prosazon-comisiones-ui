import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginacionService } from "../../../services/paginacion.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute } from "@angular/router";
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { PeticionesService } from "../../../services/peticiones.service"
import { Subscription } from 'rxjs';

declare const google: any;

/**
 * Interfaz colonia con sus propiedades y tipos.
 */
export interface dataColonia {
  idColonia: string;
  colonia: string;
}

@Component({
  selector: 'app-codigospostales',
  templateUrl: './codigospostales.component.html',
  styleUrls: ['./codigospostales.component.scss']
})
export class CodigospostalesComponent implements OnInit, OnDestroy {

  cp: any; // Variable para asignar todos los registros de códigos postales
  pages: any = {};  // Variable para asignar configuración de paginación
  cps: any[] = []; // Variable para asignar registros de códigos postales a mostrar en tabla por paginación
  allcp: any[] = []; // Variable para asignar todos los registros de códigos postales en arreglo

  entries: number = 10; // Número de filas a mostrar en tabla códigos postales

  form = false; // Variable boolean para mostrar formulario código postal
  showCP = false; // Variable boolean para mostrar formulario detalles código postal
  editCP = false; // Variable boolean para mostrar formulario editar código postal
  asignar = false; // Variable boolean para mostrar formulario asignar
  coloniascp: any; // Variable para asignar todos los registros de colonias del código postal 
  colonias: any; // Variable para asignar todos los registros de colonias no asignadas del código postal 
  coloniasasignadas: any; // Variable para asignar todos los registros de colonias asignadas del código postal 

  coloniass = new Set<dataColonia>(); // Variable para asignar registros de colonias a mostrar en tabla colonias
  coloniasAsignadass = new Set<dataColonia>(); // Variable para asignar registros de colonias asignadas a mostrar en tabla colonias asignadas
  coloniasAsignadassFilter = new Set<dataColonia>(); // Variable para asignar registros de tabla colonias asigndas
  coloniasNoAsignadassFilter = new Set<dataColonia>(); // Variable para asignar registros de tabla colonias no asigndas
  clickedRowsC = new Set<dataColonia>(); // Variable para asignar registros seleccionados de tabla colonias
  clickedRowsCA = new Set<dataColonia>(); // Variable para asignar registros seleccionados de tabla colonias asignadas

  buscarColonias = false;
  buscarColoniasA = false;

  /** Variable de formulario código postal*/
  cpform = null;

  private _subscriptionPeticion: Subscription = new Subscription();


  //mapa donde se visualizan los poligonos
  map: any;
  //arreglo de poligonos
  listaPoligonos: any

  constructor(private paginacion: PaginacionService,
    private spinner: NgxSpinnerService,
    private apinayarbotService: ApinayarbotService,
    private route: ActivatedRoute,
    public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.codigosPostalesT();
    this.listaPoligonos = [];
  }

  /**
   * Función obtener códigos postales desde api service y visualizar en tabla
   */
  codigosPostalesT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.codigosPostalesT();
    });
    this.spinner.show();
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getTablaCodigosPostales().subscribe(
          (cp_result) => {
            this.cp = cp_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.cp.length > 0) {
              this.allcp = this.cp;
              this.setPage(1);
            } else {
              this.allcp = [];
              this.cps = [];
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
   * Función generar paginación de la tabla códigos postales
   * @param {number} page Número de pagina a mostrar
   * @returns {void}
   */
  setPage(page: number) {
    if (this.cp.length > 0) {
      if (page < 1 || page > this.pages.totalPages) {
        return;
      }

      this.pages = this.paginacion.getPage(this.allcp.length, page, this.entries);

      this.cps = this.allcp.slice(this.pages.startIndex, this.pages.endIndex + 1);
    }
  }

  /**
 * Función buscar valor en tabla códigos postales
 * y mostrar solo registros que coinciden
 * @param {Event} event 
 */
  applyFilter(event: Event) {
    if (this.cp.length > 0) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.pages = {};
      this.allcp = this.cp;
      var nuevo = this.allcp;
      nuevo = nuevo.map(el => {
        if (el.cp.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          return el;
        }
        if (el.coloniasAsignadas != null) {
          if (el.coloniasAsignadas === Number(filterValue)) {
            return el;
          }
        }
      }
      );
      this.allcp = nuevo.filter(x => x != undefined);
      this.setPage(1);
    }
  }

  /**
   * Función inicializar variables cada que se cierra o cancela el formulario
   */
  close() {
    this.form = false;
    this.showCP = false;
    this.editCP = false;
    this.asignar = false;
    this.cpform = null;

    this.coloniascp = null;
    this.colonias = null;
    this.coloniass.clear();
    this.coloniasAsignadass.clear();
    this.coloniasAsignadassFilter.clear();
    this.coloniasNoAsignadassFilter.clear();
    this.clickedRowsC.clear();
    this.clickedRowsCA.clear();

    this.buscarColonias = false;
    this.buscarColoniasA = false;
  }

  /**
   * Función mostrar y cargar datos al formulario asignar colonias
   * del registro index en tabla códigos postales
   * @param {number} index Parametro indice del registro de tabla códigos postales
   */
  coloniasAsignadas(index: number) {
    this.close();
    this.cpform = this.cps[index].cp;
    this.coloniasCPGet();
    this.asignar = true;
    this.form = true;
    this.editCP = true;
  }

  /**
   * Función filtro de busqueda en la tabla colonias
   * @param event 
  */
  applyFilterColonias(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarColonias = false;
    } else {
      this.buscarColonias = true;
    }
    this.coloniass.clear();
    if (this.coloniasNoAsignadassFilter.size != 0) {
      this.coloniasNoAsignadassFilter.forEach(element => {
        this.coloniass.add(element);
      });
    }

    let nuevo = new Set<dataColonia>();
    if (this.coloniass.size != 0) {
      this.coloniass.forEach(element => {
        if (element.colonia != null) {
          if (element.colonia.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.coloniass.clear();
      nuevo.forEach(element => {
        this.coloniass.add(element);
      });
    } else {
      this.coloniass.clear();
    }
  }

  /**
   * Función filtro de busqueda en la tabla colonias asignadas
   * @param event 
  */
  applyFilterColoniasA(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarColoniasA = false;
    } else {
      this.buscarColoniasA = true;
    }
    this.coloniasAsignadass.clear();
    if (this.coloniasAsignadassFilter.size != 0) {
      this.coloniasAsignadassFilter.forEach(element => {
        this.coloniasAsignadass.add(element);
      });
    }

    let nuevo = new Set<dataColonia>();
    if (this.coloniasAsignadass.size != 0) {
      this.coloniasAsignadass.forEach(element => {
        if (element.colonia != null) {
          if (element.colonia.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.coloniasAsignadass.clear();
      nuevo.forEach(element => {
        this.coloniasAsignadass.add(element);
      });
    } else {
      this.coloniasAsignadass.clear();
    }
  }

  /**
   * Función agregar o quitar registro seleccionado con el evento click
   * de tabla colonias al conjunto clickedRowsC
   * @param {dataColonia} row Parametro registro de la tabla colonias evento click
   */
  clickedRowsLC(row: dataColonia) {
    let eliminar = 0;
    this.clickedRowsC.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsC.delete(row);
    } else {
      this.clickedRowsC.add(row);
    }
  }

  /**
  * Función agregar o quitar registro seleccionado con el evento click
  * de tabla colonias asignadas al conjunto clickedRowsCA
  * @param {dataColonia} row Parametro registro de la tabla colonias asignadas evento click
  */
  clickedRowsLCA(row: dataColonia) {
    let eliminar = 0;
    this.clickedRowsCA.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsCA.delete(row);
    } else {
      this.clickedRowsCA.add(row);
    }
  }

  /**
 * Función agregar todos los registros de tabla colonias a tabla colonias asignadas
 */
  allright() {
    if (this.buscarColonias || this.buscarColoniasA) {
      this.coloniass.forEach(element => {
        this.coloniasAsignadass.add(element);
        this.coloniasAsignadassFilter.add(element);
      });
      this.clickedRowsC.clear();

      if (this.coloniasNoAsignadassFilter.size != 0) {
        this.coloniass.forEach(element => {
          this.coloniasNoAsignadassFilter.delete(element);
        });
      }
      this.coloniass.clear();
    } else {
      this.coloniass.forEach(element => {
        this.coloniasAsignadass.add(element);
        this.coloniasAsignadassFilter.add(element);
      });
      this.clickedRowsC.clear();
      this.coloniass.clear();
      this.coloniasNoAsignadassFilter.clear();
    }
  }

  /**
   * Función quitar todos los registros de tabla colonias asignadas
   */
  allleft() {
    if (this.buscarColoniasA || this.buscarColonias) {
      this.coloniasAsignadass.forEach(element => {
        this.coloniass.add(element);
        this.coloniasNoAsignadassFilter.add(element);
      });
      this.clickedRowsCA.clear();

      if (this.coloniasAsignadassFilter.size != 0) {
        this.coloniasAsignadass.forEach(element => {
          this.coloniasAsignadassFilter.delete(element);
        });
      }
      this.coloniasAsignadass.clear();
    } else {
      this.coloniasAsignadass.forEach(element => {
        this.coloniass.add(element);
        this.coloniasNoAsignadassFilter.add(element);
      });
      this.coloniasAsignadass.clear();
      this.coloniasAsignadassFilter.clear();
      this.clickedRowsCA.clear();
    }
  }

  /**
   * Función agregar uno o varios registros seleccionados de tabla colonias
   * a tabla colonias asignadas
   */
  multipleright() {
    this.clickedRowsC.forEach(element => {
      this.coloniasAsignadass.add(element);
      this.coloniasAsignadassFilter.add(element);
      this.coloniass.delete(element);
      this.coloniasNoAsignadassFilter.delete(element);
    });
    this.clickedRowsC.clear();
  }

  /**
   * Función quitar uno o varios registros seleccionados de tabla colonias asignadas
   */
  multipleleft() {
    this.clickedRowsCA.forEach(element => {
      this.coloniasAsignadass.delete(element);
      this.coloniasAsignadassFilter.delete(element);
      this.coloniass.add(element);
      this.coloniasNoAsignadassFilter.add(element);
    });
    this.clickedRowsCA.clear();
  }

  /**
 * Función mostrar formulario detalles código postal
 * del registro index en tabla códigos postales
 * @param {number} index Parametro indice del registro de tabla códigos postales
 */
  detallesCP(index: number) {
    this.close();
    this.cpform = this.cps[index].cp;
    this.coloniasCPGet();
    this.showCP = true;
    this.form = true;

    setTimeout(() => {
      this.mapaCPGet(this.cps[index].cp);
    }, 1000);
  }

  /**
 * Función obtener el poligono del código postal
 * y visualizar en el mapa
 * @param {string} cp Parametro código postal
 */
  mapaCPGet(cp: string) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.mapaCPGet(cp);
    });
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.getPoligonoCodigoPostalMapa(cp);
      peticion.subscribe(
        (mapa_result) => {
          this.peticionesService.onCancelPendingRequests();
          if (mapa_result.length) {
            // Configuración e implementación mapa
            var mapElement = document.getElementById("map-custom2") as any;
            var lat = mapElement!.getAttribute("data-lat");
            var lng = mapElement!.getAttribute("data-lng");

            var myLatlng = new google.maps.LatLng(lat, lng);
            var mapOptions = {
              zoom: 13,
              scrollwheel: false,
              center: myLatlng,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            if (this.map == null) {
              this.map = new google.maps.Map(mapElement, mapOptions);
            }

            if (this.map != null && this.listaPoligonos) {
              this.listaPoligonos.forEach(poligono => {
                poligono.setMap(null);
              });
            }

            //posicion para centrar el mapa 
            let centerX = 0;
            let centerY = 0;
            let x1; //the lowest x coordinate
            let y1; //the lowest y coordinate
            let x2; //the highest x coordinate
            let y2; //the highest y coordinate

            var lowestX = Number.POSITIVE_INFINITY;
            var highestX = Number.NEGATIVE_INFINITY;

            var lowestY = Number.POSITIVE_INFINITY;
            var highestY = Number.NEGATIVE_INFINITY;


            var tmpX;
            var tmpY;

            const decodeString = google.maps.geometry.encoding.decodePath(mapa_result[0].poligono);

            for (var i = decodeString.length - 1; i >= 0; i--) {

              tmpX = decodeString[i].lng();
              tmpY = decodeString[i].lat();

              if (tmpX < lowestX) lowestX = tmpX;
              if (tmpX > highestX) highestX = tmpX;

              if (tmpY < lowestY) lowestY = tmpY;
              if (tmpY > highestY) highestY = tmpY;
            }

            x1 = lowestX;
            x2 = highestX;
            y1 = lowestY;
            y2 = highestY;

            centerX = x1 + ((x2 - x1) / 2);
            centerY = y1 + ((y2 - y1) / 2);

            let latlongCenter = new google.maps.LatLng(centerY, centerX);

            this.map.panTo(latlongCenter);

            mapa_result.forEach((elemt: any) => {

              const decodeString = google.maps.geometry.encoding.decodePath(elemt.poligono);
              console.log(decodeString);


              var marker = new google.maps.Polygon({
                path: decodeString,
                position: latlongCenter,
                map: this.map,
                strokeColor: '#5e72e4',
                strokeWeight: 2,
                fillOpacity: 0,
              });

              this.listaPoligonos.push(marker);

              var contentString =
                '<div class="info-window-content"><h2>CP: ' + elemt.cp + '</h2>';

              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });

              var self = this;

              google.maps.event.addListener(marker, "click", function () {
                infowindow.open(self.map, marker);
              });
            })

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
    });
  }

  /**
   * Función cambiar el número de filas a mostrar en tabla códigos postales
   * @param $event 
   */
  entriesChange($event: any) {
    if (this.cp.length > 0) {
      if (parseInt($event.target.value) < 0) {

      } else {
        this.entries = parseInt($event.target.value);
        this.setPage(1);
      }
    }
  }

  /**
   * Función obtener colonias asignadas y no asignadas del código postal
   * desde apinayarbot service
   */
  coloniasCPGet() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.coloniasCPGet();
    });
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getColoniasCP(this.cpform).subscribe(
          (colonias_result) => {
            this.coloniascp = colonias_result;
            this.peticionesService.onCancelPendingRequests();
            this.coloniasasignadas = this.coloniascp.asignadas;
            if (this.coloniasasignadas.length > 0) {
              for (let index = 0; index < this.coloniasasignadas.length; index++) {
                this.coloniasAsignadass.add(this.coloniasasignadas[index]);
                this.coloniasAsignadassFilter.add(this.coloniasasignadas[index]);
              }
            }
            this.colonias = this.coloniascp.noAsignadas;
            if (this.colonias.length > 0) {
              for (let index = 0; index < this.colonias.length; index++) {
                this.coloniass.add(this.colonias[index]);
                this.coloniasNoAsignadassFilter.add(this.colonias[index]);
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
    * Función crear colonias asignados de código postal desde api service.
    */
  guardarAsignarColonias() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.guardarAsignarColonias();
    });
    let nuevo = new Set<string>();
    if (this.coloniasAsignadass.size != 0) {
      this.coloniasAsignadass.forEach(element => {
        nuevo.add(element.idColonia);
      });
    }
    let ar = Array.from(nuevo);
    const colonias = {
      "cp": this.cpform,
      "colonias": ar
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postCodigosPostalesAsignarColonias(colonias);
      peticion.subscribe(
        (colonias_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'COLONIAS GUARDADOS',
            text: colonias_result,
            confirmButtonColor: '#5E72E4',
          });
          this.codigosPostalesT();
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
 * Función borrar código postal
 * del registro index en tabla códigos postales
 * @param {number} index Parametro indice del registro de tabla códigos postales
 */
  borrarCP(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'ELIMINAR CÓDIGO POSTAL: ' + this.cps[index].cp,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'ELIMINAR USUARIO',
      cancelButtonText: 'CANCELAR',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCP(index);
      }
    })
  }

  deleteCP(index: number) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.deleteCP(index);
    });
    const cp = this.cps[index].cp;
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.deleteCodigosPostales(cp);
      peticion.subscribe(
        (cp_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire(
            'CÓDIGO POSTAL ELIMINADO!',
            this.cps[index].cp,
            'success'
          )
          this.codigosPostalesT();
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
