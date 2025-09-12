import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Selectr from 'mobius1-selectr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subscription } from 'rxjs';
import { CustomerTransactionDetailService } from 'src/app/services/apis/customer-transaction-detail.service';
import { PeticionesService } from 'src/app/services/peticiones.service';
import Swal from 'sweetalert2';
import { environment as env } from "../../../environments/environment.prod";
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-control-despachos',
  templateUrl: './control-despachos.component.html',
  styleUrls: ['./control-despachos.component.scss']
})
export class ControlDespachosComponent implements OnInit, OnDestroy {

  listaRegistros: any; // Variable para asignar todos los registros
  pages: any = {};  // Variable para asignar configuración de paginación
  listaRegistrosTabla: any[] = []; // Variable para asignar registros a mostrar en tabla por paginación
  allRegistros: any[] = []; // Variable para asignar todos los registros
  entries: number = 10; // Número de filas a mostrar en tabla
  cantidadRegistros: number;

  filter = {
    page: 1,
    limit: 25,
    search: null,
    startDate: null,
    endDate: null,
    serviceStation: null,
    shiftEnd: null,
    status: null,
    onlyActive: true
  };

  lastUpdate: string = '22/01/2024 13:21';

  selectrE: any; // Identifica elemento select-estacion
  selectorE: Selectr;
  estaciones = [
    {
      "value": '275',
      "text": 'Campesino'
    },
    {
      "value": '493',
      "text": 'Agua prieta'
    },
    {
      "value": '727',
      "text": 'Concordia'
    },
  ];

  selectrC: any; // Identifica elemento select-corte
  selectorC: Selectr;
  corte = [
    {
      "value": '1',
      "text": 'T1'
    },
    {
      "value": '2',
      "text": 'T2'
    },
    {
      "value": '3',
      "text": 'T3'
    },
  ];

  ListaRegistrosSeleccionados: any = [];
  todosRegistrosSeleccionados: boolean;

  public subscriber: Subscription;
  private _subscriptionPeticion: Subscription = new Subscription();

  hubConnection: signalR.HubConnection | undefined;

  constructor(private spinner: NgxSpinnerService,
    private customerTransactionDetailService: CustomerTransactionDetailService,
    private route: ActivatedRoute,
    public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.selectrE = document.getElementById("select-estacion");

    if (this.estaciones.length > 0) {
      for (let index = 0; index < this.estaciones.length; index++) {
        const option = document.createElement('option');
        option.value = this.estaciones[index].value,
          option.text = this.estaciones[index].text
        this.selectrE.appendChild(option);
      }
    } else {
      const option = document.createElement('option');
      this.selectrE.appendChild(option);
    }

    var options = {
      multiple: true,
      placeholder: "Selecciona"
    };

    this.selectorE = new Selectr(this.selectrE, options);

    this.selectrC = document.getElementById("select-corte");

    if (this.corte.length > 0) {
      for (let index = 0; index < this.corte.length; index++) {
        const option = document.createElement('option');
        option.value = this.corte[index].value,
          option.text = this.corte[index].text
        this.selectrC.appendChild(option);
      }
    } else {
      const option = document.createElement('option');
      this.selectrC.appendChild(option);
    }

    this.selectorC = new Selectr(this.selectrC, options);

    this.obtenerRegistros();
    this.startConnection();
  }

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${env.SIGNALR_SERVER2}/customerTransactionDetailHub`, {
        
      }).build();
    
      

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.startListener();
      })
      .catch(err => console.log('Error while starting connection: ' + err));

  }

  startListener() {
    this.hubConnection?.on('ReceiveUpdateRecord', (data) => {
      console.log("cambio");
      console.log(data);
    })
  }

  async obtenerRegistros(onViewMore = false, page: number = 1): Promise<void> {
    try {
      if (onViewMore) {
        this.filter.page = page;
      } else {
        this.filter.page = 1;
      }

      var result: string[] = [];
      var options = this.selectrE && this.selectrE.options;
      var opt;

      for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];

        if (opt.selected) {
          result.push(opt.value);
        }
      }

      if (result.length > 0) {
        this.filter.serviceStation = result.join(",");
      } else {
        this.filter.serviceStation = null;
      }

      var resultC = [];
      var optionsC = this.selectrC && this.selectrC.options;
      var optC;

      for (var i = 0, iLen = optionsC.length; i < iLen; i++) {
        optC = optionsC[i];

        if (optC.selected) {
          resultC.push(optC.value);
        }
      }

      if (resultC.length > 0) {
        this.filter.shiftEnd = resultC.join(",");
      } else {
        this.filter.shiftEnd = null;
      }

      this.filter.limit = this.entries;
      this.spinner.show();
      this.route.paramMap.subscribe(
        (params) => {
          this.customerTransactionDetailService.get(this.filter).subscribe(
            (result) => {
              this.listaRegistros = result;
              this.listaRegistrosTabla = this.listaRegistros.transactions;
              this.cantidadRegistros = this.listaRegistros.meta.totalItems;
              this.pages.totalPages = this.listaRegistros.meta.totalPages;

              this.pages.pages = [];
              for (var i = 0; i < this.listaRegistros.meta.totalPages; i++) {
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

  async filtersCheckboxChange(columna) {
    let ckTodos = document.getElementById("ckTodos") as HTMLInputElement;
    let ckSinRegistrar = document.getElementById("ckSinRegistrar") as HTMLInputElement;
    let ckRegistrado = document.getElementById("ckRegistrado") as HTMLInputElement;

    if (columna == "todos" && ckTodos.checked) {
      ckSinRegistrar.checked = true;
      ckRegistrado.checked = true;
    }
    if (columna == "todos" && !ckTodos.checked) {
      ckSinRegistrar.checked = false;
      ckRegistrado.checked = false;
    }

    var result: string[] = [];
    if (ckTodos.checked) {
      result.push("InProgress");
      result.push("Error");
    }
    if (ckSinRegistrar.checked) {
      result.push("NotRegistered");
    }
    if (ckRegistrado.checked) {
      result.push("Registered");
    }

    if (result.length > 0) {
      this.filter.status = result.join(",");
    } else {
      this.filter.status = null;
    }

    this.obtenerRegistros(false);
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
    this.filter.endDate = null;
    this.filter.shiftEnd = null;
    this.filter.serviceStation = null;
    this.filter.shiftEnd = null;
    this.filter.search = null;
    this.obtenerRegistros();
  }

  async registrarPendientes() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.registrarPendientes();
    });

    this.spinner.show();

    var transactions = [];
    var registerAllPendings;
    if (this.ListaRegistrosSeleccionados.length > 0) {
      //si esta seleccionado y el estatus esta 'En progreso' o 'Registrado'.
      if (this.ListaRegistrosSeleccionados.find(x => x.estatus == 'En progreso') || this.ListaRegistrosSeleccionados.find(x => x.estatus == 'Registrado')) {
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: '',
          text: 'Solo se pueden enviar registros que no hayan sido enviados o con error, quita de la selección los registros que estén en este estatus',
          confirmButtonColor: '#5E72E4',
          confirmButtonText: 'Aceptar',
          iconColor: '#F6891E',
        });
        return;
      } else {
        await this.ListaRegistrosSeleccionados.forEach(elemt => {
          transactions.push(elemt.customerTransactionDetailId);
        });
        registerAllPendings = false;
      }
    } else {
      registerAllPendings = true;
    }
    const body = {
      "transactions": transactions,
      "registerAllPendings": registerAllPendings,
    }

    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.customerTransactionDetailService.post(body);
      peticion.subscribe(
        (result) => {
          this.spinner.hide();
          this.peticionesService.onCancelPendingRequests();
          this.obtenerRegistros(false);
        },
        (err) => {
          this.spinner.hide();
          if (err.status != 401) {
            this.peticionesService.onCancelPendingRequests();
          }
          let errores = err.error.ErrorMessages.join("<br>");
          Swal.fire({
            icon: 'error',
            title: "Ocurrio un error al enviar los registros a dynamics",
            html: errores,
            confirmButtonColor: '#5E72E4',
            iconColor: '#510A00',
          });
          console.log(err);
          this.obtenerRegistros(false);
        }
      );
    });
  }

  obtenerFechaFormat(date) {
    //Formatear registro fecha
    var fecha = new Date(date);
    var dd = String(fecha.getDate()).padStart(2, '0');
    var mm = String(fecha.getMonth() + 1).padStart(2, '0');
    var yyyy = fecha.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  obtenerHora(date) {
    const fecha = new Date(date);

    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();

    const horaFormateada = `${this.agregarCeroDelante(horas)}:${this.agregarCeroDelante(minutos)}:${this.agregarCeroDelante(segundos)}`;

    return horaFormateada;
  }

  agregarCeroDelante(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  //funcion para agregar un registro a la lista registros pendientes
  agregarRegistrosPendientes(registro) {
    //si esta seleccionado y no existe en la lista agregarlo
    if (registro.seleccionado == true && !this.ListaRegistrosSeleccionados.find(x => x.customerTransactionDetailId == registro.customerTransactionDetailId)) {
      this.ListaRegistrosSeleccionados.push(registro);
    }
    //si no esta seleccionado y existe en la lista eliminarlo
    else if (registro.seleccionado == false && this.ListaRegistrosSeleccionados.find(x => x.customerTransactionDetailId == registro.customerTransactionDetailId)) {
      let index = this.ListaRegistrosSeleccionados.findIndex(x => x.customerTransactionDetailId == registro.customerTransactionDetailId);
      if (index != -1) {
        this.ListaRegistrosSeleccionados.splice(index, 1);
      }
    }
  }

  seleccionMultipleRegistros() {
    this.ListaRegistrosSeleccionados = [];
    this.listaRegistrosTabla.forEach(registro => {
      registro.seleccionado = this.todosRegistrosSeleccionados;

      if (this.todosRegistrosSeleccionados == true) {
        this.ListaRegistrosSeleccionados.push(registro);
      }
    });
  }
}
