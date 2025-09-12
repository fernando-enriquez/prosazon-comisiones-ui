import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NorthwareUtilsService } from 'src/app/services/northwareUtils.service';
import { PaginacionService } from 'src/app/services/paginacion.service';
import { PeticionesService } from 'src/app/services/peticiones.service';
import { Papa } from 'ngx-papaparse';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AttendanceSheetService } from 'src/app/services/apis/attendance-sheet.service';

@Component({
  selector: 'app-lista-negra',
  templateUrl: './lista-negra.component.html',
  styleUrls: ['./lista-negra.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListaNegraComponent implements OnInit {


  employeeList:any = [];
  asignacionList:any = [];
  listaAsistencia:any =[];
  tiposAsignacionList:any = [];
  listaRegistros: any; // Variable para asignar todos los registros de motivos no entrega
  pages: any = {};  // Variable para asignar configuración de paginación
  listaRegistrosTabla: any[] = []; // Variable para asignar registros de motivos no entrega a mostrar en tabla por paginación
  allRegistros: any[] = []; // Variable para asignar todos los registros de motivos no entrega en arreglo
  entries: number = 10; // Número de filas a mostrar en tabla responsables no visita
  enableEditing:boolean; //Controls whether the attendance list can be edited or not

  selectedEmployee:any = [];
  dropdownSettings: any = {};//has the setting for employee´s ng multiselect

  form = false; // Variable boolean para mostrar formulario motivo no entrega
  mostrarVentanaCarga = false; // Variable boolean para mostrar formulario agregar motivo no entrega
  rowsFound:number = -1;
  guardarButtonDisabled:boolean;
  cantidadRegistros:number;
  lastUpdate:string;

  currentYearComission:number = 2025;
  currentMothComission:number = 10;
  datePeriods:any = [];
  periodControls:any = {
    Lun:false,
    LunText:"",
    Mar:false,
    MarText:"",
    Mie:false,
    MieText:"",
    Jue:false,
    JueText:"",
    Vie:false,
    VieText:"",
    Sab:false,
    SabText:"",
    Dom:false,
    DomText:""  
  };
  periodComission:number;

  filter = {
    employeeIds:[],
    begin:null,
    end:null
  };

  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(private spinner: NgxSpinnerService, 
              private attendanceSheetService : AttendanceSheetService,
              private northwareUtilsService: NorthwareUtilsService, 
              private route: ActivatedRoute, 
              public peticionesService: PeticionesService, 
              private papa: Papa) { }

  ngOnInit(): void {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'fullName',
      enableCheckAll: false,
      itemsShowLimit: 9,
      allowSearchFilter: true
    };

    //get general catalogs
    this.obtenerEmpleados();
    this.getTiposAsignacion();
    this.initDateParams();
    this.setMonthPeriods();
  }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }
  
  onItemSelect(item: any) {
    this.selectedEmployee.push(item.id);
}

  onItemDeSelect(item: any) {
    const index = this.selectedEmployee.indexOf(item.id);
    if (index !== -1) {
      this.selectedEmployee.splice(index, 1);
    }
  }


    /**
     * Función inicializar variables cada que se cierra o cancela el formulario
     */
    close() {
    this.form = false;
    }

    clickHandleFile(){
      // this.spinner.show();
      // var self = this;
      // setTimeout(function(){
      //   //self.spinner.hide();
      // },10000);
    }


    async fileChangeEvent(event: any, type: any) {
      this.rowsFound = -1;
      this.guardarButtonDisabled = true;
     // this.registrosGuardar = [];
        if(!event){
          return;
        }
        
        this.spinner.show();
        const files = event.target.files;

        if (!files[0].type.includes('csv')){
          Swal.fire({
            icon: 'info',
            title: "Tipo de archivo",
            text: 'El archivo que intentas subir no es del tipo CSV',
          });
          this.spinner.hide();
          return;
        }

        if (Number(files[0].size) > 10485760) {
          Swal.fire({
            icon: 'info',
            title: "Tamaño de archivo",
            text: 'El tamaño maximo permitido es 10 MB',
          });
          this.spinner.hide();
          return;
        }
          
        const reader = new FileReader();
  
        reader.onload = (e) => {
          let data = e.target.result;

          let options = {
            complete: (results, file) => {
              // for (let index = 0; index < results.data.length; index++) {
                for (let index = 0; index < results.data.length; index++) {
                  let row = results.data[index];
                  if(!row[1] || row[1] == "" || row[1].toLowerCase() == "rfc"){
                    continue;
                  }
                  let item = {
                    Id:row[0],
                    RFC: row[1],
                    nombre:row[2],
                    estatus:row[3]
                  }
                  //this.registrosGuardar.push(item);
                }
          
                //this.rowsFound = this.registrosGuardar.length;
                if(this.rowsFound > 0){
                  this.guardarButtonDisabled = false;
                }

                this.spinner.hide();
            }
          }
  
          this.papa.parse((<string>data),options);
        };

        reader.readAsText(files[0],"UTF-8");
      }


      async obtenerEmpleados(): Promise<void>{
        try {
          this.employeeList = [];
          this.spinner.show();
          this.route.paramMap.subscribe(
            (params) => {
              this.northwareUtilsService.getEmployee().subscribe(
                (empleados) => {
                  this.employeeList = empleados;
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

      async getTiposAsignacion(): Promise<void>{
        try {
          this.tiposAsignacionList = [];
          this.spinner.show();
          this.route.paramMap.subscribe(
            (params) => {
              this.northwareUtilsService.getTiposAsignacion().subscribe(
                (data) => {
                  this.tiposAsignacionList = data;
                  this.spinner.hide();
                },
                (err) => {
                  if (err.status != 401) {
                    this.peticionesService.onCancelPendingRequests();
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

      initDateParams()
      {
        this.currentYearComission = new Date().getFullYear();
        this.currentMothComission = new Date().getMonth();
      }

      setMonthPeriods()
      {
        this.datePeriods = [];
        let periodId = 0;

        //UPDATE: NOT USING THIS ANYMORE UNTIL PM SAYS ITS NECESARY
        //THATS WHY IN THE IF STATEMENT IM EVALUATING THE MONTH TO -1, NEVER GONNA ENTER
        //if the month is january take the first date and start to count until find a sunday date 
        //and the next iteration should be:
        //search for the first monday date
        //once monday is found, start to count  until find a sunday date
         //stop until sunday is the last of the month or is part of next month
        if( this.currentMothComission == -1)
        {
          let beginDate = new Date(this.currentYearComission,this.currentMothComission,1);
          
          //search for the next sunday date
          let endDate:Date = new Date(beginDate);
          endDate.setDate(endDate.getDate() + 1);

          //sum +1 day until date match sunday
          while(endDate.getDay() != 0)
          {
            endDate.setDate(endDate.getDate() + 1);
          }

          //add the period
          let period:Period = {
            Id:periodId,
            Text: this.getDateText(beginDate) + " al " + this.getDateText(endDate),
            Begin:beginDate,
            End:endDate
          }
          this.datePeriods.push(period);
          periodId++;

          //start to generate periods normally while sunday is the last of the month or is part of next month
          let stopGeneratingPeriods:boolean = false;
          
          while(stopGeneratingPeriods == false)
            {
              //monday
              beginDate = new Date(endDate);
              beginDate.setDate(beginDate.getDate() + 1);

              //sunday
              endDate = new Date(beginDate);
              //sum +1 day until date match sunday
              while(endDate.getDay() != 0)
              {
                endDate.setDate(endDate.getDate() + 1);
              }

              //add the period
              let period:Period = {
              Id:periodId,
              Text: this.getDateText(beginDate) + " al " + this.getDateText(endDate),
              Begin:beginDate,
              End:endDate
              }
              this.datePeriods.push(period);
              periodId++;

             //evaluate if sunday is last day of moth or part of next month
             stopGeneratingPeriods = this.esUltimoODistintoMes(endDate, this.currentMothComission, this.currentYearComission);
            }
          
        }

        //UPDATE: BY DEFAULT IM USING THIS SET, MONDAY TO SUNDAY DOESNT MATTER IF IS E.O.Y.
        //if is not january 
        //search for the first monday date
        //once monday is found, start to count until find a sunday date
        //stop until sunday is the last of the month or is part of next month
        else
        {
              //start to generate periods normally while sunday is the last of the month or is part of next month
              let stopGeneratingPeriods:boolean = false;
              let beginDate = new Date(this.currentYearComission,this.currentMothComission,1);

              while(stopGeneratingPeriods == false)
                {
                  //monday
                  while(beginDate.getDay() != 1)
                    {
                      beginDate.setDate(beginDate.getDate() + 1);
                    }
    
                  //sunday
                  let endDate = new Date(beginDate);
                  //sum +1 day until date match sunday
                  while(endDate.getDay() != 0)
                  {
                    endDate.setDate(endDate.getDate() + 1);
                  }
    
                  //add the period
                  let period:Period = {
                  Id:periodId,
                  Text: this.getDateText(beginDate) + " al " + this.getDateText(endDate),
                  Begin:beginDate,
                  End:endDate
                  }
                  this.datePeriods.push(period);
                  periodId++;

                  beginDate = new Date(endDate);
    
                  //evaluate if sunday is last day of moth or part of next month
                  stopGeneratingPeriods = this.esUltimoODistintoMes(endDate, this.currentMothComission, this.currentYearComission);
                }

                //set the first element of the period´s array to the periodComission property
                if(this.datePeriods.length > 0)
                  {
                    this.periodComission = this.datePeriods[0].Id;
                  }
                

                //if the month is december evaluate if the last period takes dates from the next year
                //if it so cut the period until last day of the month (dic 31)
                // debugger;
                // let lastIndex = this.datePeriods.length - 1;
                // if(this.datePeriods[lastIndex].End.getFullYear() != this.currentYearComission)
                // {
                //   this.datePeriods[lastIndex].End = new Date(this.currentYearComission,this.currentMothComission,31);
                //   this.datePeriods[lastIndex].Text = this.getDateText(this.datePeriods[lastIndex].Begin) + " al " + this.getDateText(this.datePeriods[lastIndex].End);
                // }
        }
      }

      setPeriodDays()
      {
        //reset
        this.periodControls = {
            Lun:false,
            LunText:"",
            Mar:false,
            MarText:"",
            Mie:false,
            MieText:"",
            Jue:false,
            JueText:"",
            Vie:false,
            VieText:"",
            Sab:false,
            SabText:"",
            Dom:false,
            DomText:""  
        };
       //get selected period
       debugger;
       let period:Period = this.datePeriods[this.periodComission];

       //iterate over dates and check/uncheck control days
       let currentDate:Date = new Date(period.Begin);

       while(currentDate <= period.End)
        {
          if(currentDate.getDay() == 1)
          {
          this.periodControls.Lun = true;
          this.periodControls.LunText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 2)
          {
          this.periodControls.Mar = true;
          this.periodControls.MarText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 3)
          {
          this.periodControls.Mie = true;
          this.periodControls.MieText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 4)
          {
          this.periodControls.Jue = true;
          this.periodControls.JueText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 5)
          {
          this.periodControls.Vie = true;
          this.periodControls.VieText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 6)
          {
          this.periodControls.Sab = true;
          this.periodControls.SabText= this.getDateText(currentDate);
          }
          if(currentDate.getDay() == 0)
          {
          this.periodControls.Dom = true;
          this.periodControls.DomText= this.getDateText(currentDate);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      getDateText(date) {
        const dia = date.getDate().toString().padStart(2, '0'); // Día en formato 2 dígitos
        const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato 2 dígitos (0-based)
        const anio = date.getFullYear(); // Año completo
        return `${dia}/${mes}/${anio}`;
      }

       esUltimoODistintoMes(fecha, mesEsperado, anioEsperado) {
        const ultimoDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
        
        // Verificar si es el último día del mes
        const esUltimoDia = fecha.getDate() === ultimoDiaDelMes;
      
        // Verificar si la fecha pertenece al mes y año esperados
        const esMesDistinto = fecha.getMonth() != mesEsperado || fecha.getFullYear() != anioEsperado;
      
        return esUltimoDia || esMesDistinto;
      }

      async getAssignments (): Promise<void>{
        try {
          this.asignacionList = [];
          this.listaAsistencia = [];
          debugger;
          let period:Period = this.datePeriods[this.periodComission];
          this.filter.employeeIds = this.selectedEmployee;
          this.filter.begin = period.Begin;
          this.filter.end = period.End;

          this.spinner.show();
          this.route.paramMap.subscribe(
            (params) => {
              this.northwareUtilsService.getAsignaciones(this.filter).subscribe(
                (asignaciones) => {
                  this.asignacionList = asignaciones;

                  if(this.asignacionList.length > 0)
                  {
                    this.asignacionList.forEach(element => {
                      var asistencia = {
                         AssingmentId:element.assingmentId,
                         empleado:element.employee.fullName,
                         cliente:element.branchOffice.customer.name,
                         sucursal:element.branchOffice.name,
                         status:element.status == "Confirmed" ? "Confirmada" : "En edición",
                         AttendanceSheetId:element.attendanceSheetId,
                         CommuteAmount:element.commuteAmount,
                         Monday:element.monday,
                         Tuesday:element.tuesday,
                         Wednesday:element.wednesday,
                         Thursday:element.thursday,
                         Friday:element.friday,
                         Saturday:element.saturday,
                         Sunday:element.sunday
                      }
                      
                      this.listaAsistencia.push(asistencia);
                     });

                     this.enableEditing = false;
                  }
                  else
                  {
                    Swal.fire({
                      icon: 'info',
                      title: "Información no encontrada",
                      text: 'No existe asignaciones para este empleado en este periodo',
                    });
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
                      text: 'Ocurrió un error al obtener las asignaciones',
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

      resetearRegistros(){
        let text = document.getElementById("txtBusqueda") as HTMLInputElement;
        text.value = "";
      }

      validarInput(event: KeyboardEvent) {
        const inputChar = String.fromCharCode(event.charCode);
        const pattern = /^[0-9.,]+$/;
        if (!pattern.test(inputChar)) {
          event.preventDefault();
        }
      }

      setEnableEditing(enable:boolean)
      {
        if(enable == true)
        {
          Swal.fire({
            title: "Editar la lista",
            text: "¿Deseas editar la lista de existencia actual?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Si, editar la lista"
          }).then((result) => {
            if (result.isConfirmed) {
              this.enableEditing = enable;
            }
          });
        }
        else
        {
          Swal.fire({
            title: "¿Cancelar la edición?",
            text: "Los cambios no serán guardados",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Si, cancelar la edición"
          }).then((result) => {
            if (result.isConfirmed) {
              this.enableEditing = enable;
            }
          });
        }
      }

      saveAttendanceSheet(confirm:boolean){
        var attendanceSheetPosting:any = [];
        var validation:boolean = true;

        //validate, if confirm is true all the field must have a value
        debugger;
        if(confirm == true)
        {
         this.listaAsistencia.forEach(asistencia => {
          if
          (
            !asistencia.Monday
            ||
            !asistencia.Tuesday
            ||
            !asistencia.Wednesday
            ||
            !asistencia.Thursday
            ||
            !asistencia.Friday
            ||
            !asistencia.Saturday
            ||
            !asistencia.Sunday
          )
          {
            validation = false;
          }
         });
        }

        if(!validation){
          Swal.fire({
            icon: 'info',
            title: 'Campos incompletos',
            text: 'Para poder confirmar, todos los campos deben tener un valor',
          });
          return;
        }

        //extract from the attendance sheet list the confirmed ones
         //if there are no attendance sheet afer that, show a message
         //confirmed = "No hay ninguna asistencia por confirmar"
         //save = "Todas las listas estan confirmadas"
        debugger;
         attendanceSheetPosting = this.listaAsistencia.filter(x => x.status != "Confirmada");

         if(attendanceSheetPosting.length == 0){
          Swal.fire({
            icon: 'info',
            text: confirm == true ? "No hay ninguna asistencia por confirmar":"Todas las listas se encuentran actualmente confirmadas"
          });
         }

        //create the object to send
        var attendanceObject = {
          "attendances": attendanceSheetPosting,
          "confirm":confirm
        };

        //call to post api endpoint
        this.attendanceSheetService.postAttendanceSheet(attendanceObject).subscribe((response) =>{
          if(response == true){
            this.enableEditing = false;
            this.getAssignments();
            Swal.fire({
              icon: 'success',
              title: 'Lista de asistencia actualizada',
              text: '',
            });
          }
        },

        (err) => {
          if (err.status != 401) {
            this.peticionesService.onCancelPendingRequests();
          }
          if (err.status === 500) {
            Swal.fire({
              icon: 'warning',
              title: 'Algo salió mal',
              text: 'Contacte al administrador para solucionar el problemna',
            });
          } else {
            console.log(err);
          }
          this.spinner.hide();
        }
      );
      }

    }//end of class

    export interface Period
    {
      Id:number;
      Text:string;
      Begin:Date;
      End:Date;
    };