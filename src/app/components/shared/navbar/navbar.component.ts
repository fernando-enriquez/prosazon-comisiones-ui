import { Component, OnDestroy, OnInit } from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import {
  Location
} from "@angular/common";
import { Subscription } from "rxjs";
import { DaterangeService } from "src/app/services/daterange.service";
import jwt_decode from 'jwt-decode';
import { ApiauthenticationService } from "../../../services/apiauthentication.service";
import { PeticionesService } from "../../../services/peticiones.service"
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment as env} from "../../../../environments/environment.prod";
import { NorthwareUtilsService } from "src/app/services/northwareUtils.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, OnDestroy {
  hubConnection: signalR.HubConnection | undefined;

  ListaAlertas:any;
  public focus: any;
  public listTitles: any[] = [];
  public location: Location;
  sidenavOpen: boolean = true;

  fechaIni = new Date();
  fechaFin = new Date();
  bsRangeDate: Date[] = [];

  textoFechaSistema: String = "";

  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  dias_semana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  datepicker = false;

  public subscriber: Subscription;

  nameuser: string | null = null;

  private _subscriptionPeticion: Subscription;

  constructor(
    location: Location,
    private router: Router,
    private localeService: BsLocaleService,
    private DateRangeService: DaterangeService,
    private apiauthenticationService: ApiauthenticationService,
    private route: ActivatedRoute,
    public peticionesService: PeticionesService,
    private northwareUtilsService: NorthwareUtilsService
  ) {
    this.location = location;
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator

      }
      if (event instanceof NavigationEnd) {
        // Hide loading indicator

        if (window.innerWidth < 1200) {
          document.body.classList.remove("g-sidenav-pinned");
          document.body.classList.add("g-sidenav-hidden");
          this.sidenavOpen = false;
        }
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });

    /** Configuración datepicker a español */
    defineLocale('es', esLocale)
    this.localeService.use('es');

    // Suscribir cambio de ruta
    this.subscriber = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/dashboard') {
          this.datepicker = true;

          if (localStorage.getItem('daterange')) {
            var daterangeLS = localStorage.getItem('daterange');
            if (daterangeLS) {
              let arr = daterangeLS.split(',');
              this.fechaIni = new Date(arr[0]);
              this.fechaFin = new Date(arr[1]);

              this.bsRangeDate = [this.fechaIni, this.fechaFin];
            }
          } else {
            this.fechaIni = new Date();
            this.fechaFin = new Date();

            var mes = this.fechaIni.getMonth();
            var anio = this.fechaIni.getFullYear();
            
            this.fechaIni = new Date(anio, mes, 1);
            this.fechaFin = new Date(anio, mes + 1, 0);
          
            this.bsRangeDate = [this.fechaIni, this.fechaFin];
          }

        } else {
          this.datepicker = false;
        }
      }
    });

    if (this.router.url === '/dashboard') {
      this.datepicker = true;

      if (localStorage.getItem('daterange')) {
        var daterangeLS = localStorage.getItem('daterange');
        if (daterangeLS) {
          let arr = daterangeLS.split(',');
          this.fechaIni = new Date(arr[0]);
          this.fechaFin = new Date(arr[1]);

          this.bsRangeDate = [this.fechaIni, this.fechaFin];
        }
      } else {
        this.fechaIni = new Date();
        this.fechaFin = new Date();

        var mes = this.fechaIni.getMonth();
        var anio = this.fechaIni.getFullYear();
        
        this.fechaIni = new Date(anio, mes, 1);
        this.fechaFin = new Date(anio, mes + 1, 0);
      
        this.bsRangeDate = [this.fechaIni, this.fechaFin];
      }

    } else {
      this.datepicker = false;
    }
  }
  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit() {
    this.ListaAlertas = [];
    this.listTitles = ROUTES.filter(listTitle => listTitle);

    // Formato del texto nombre usuario a visualizar
    var decoded: any = jwt_decode(this.apiauthenticationService.accessToken);
    console.log("decoded");
    console.log(decoded);
    localStorage.setItem("userIdNayar", decoded.IdUsuario);
    this.nameuser = decoded["name"];

    // Formato del texto rango fechas a visualizar
    this.textoFechaSistema = this.dias_semana[this.fechaIni.getDay()] + ', ' + this.fechaIni.getDate() + ' de ' + this.meses[this.fechaIni.getMonth()] + ' de ' + this.fechaIni.getUTCFullYear() + ' - ' + this.dias_semana[this.fechaFin.getDay()] + ', ' + this.fechaFin.getDate() + ' de ' + this.meses[this.fechaFin.getMonth()] + ' de ' + this.fechaFin.getUTCFullYear()
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

  openSidebar() {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
      this.sidenavOpen = false;
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
      this.sidenavOpen = true;
    }
  }

  toggleSidenav() {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
      this.sidenavOpen = false;
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
      this.sidenavOpen = true;
    }
  }

  onChangeF(event: any) {
    this.textoFechaSistema = this.dias_semana[event[0].getDay()] + ', ' + event[0].getDate() + ' de ' + this.meses[event[0].getMonth()] + ' de ' + event[0].getUTCFullYear() + ' - ' + this.dias_semana[event[1].getDay()] + ', ' + event[1].getDate() + ' de ' + this.meses[event[1].getMonth()] + ' de ' + event[1].getUTCFullYear();
    this.DateRangeService.changeDateRange(this.bsRangeDate);
  }

  logout() {
    this.apiauthenticationService.logout();
    this.router.navigateByUrl('login');
  }
}
