import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditarHorarioComponent } from './editar-horario/editar-horario.component';
import { HorariosService } from 'src/app/services/horarios.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HorariosComponent implements OnInit {

  @ViewChild("first") inputToFocus: ElementRef;
  
  @Input() RutaInput:any;

  Ruta:any;

  isLoading = false;

  schedules:any;


  
  constructor(
    private spinner: NgxSpinnerService,
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private horariosService:HorariosService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) { 
    this.schedules = {
      "monday":[],
      "tuesday":[],
      "wednesday":[],
      "thursday":[],
      "friday":[],
      "saturday":[],
      "sunday":[],
    };
  }

  ngOnInit(): void {
    this.loadData();
    this.loadSchedules();
  }

  private loadData():void {
    this.Ruta = this.RutaInput;
    console.log(this.RutaInput);
  }

  addSchedule(day:string, DayNumber:number){
    const modalRef = this.modalService.open(EditarHorarioComponent, { centered: true, scrollable: true, backdrop: 'static',size: 'md' });
    modalRef.componentInstance.DayInput = day;
    modalRef.componentInstance.IsEditingInput = false;
    modalRef.componentInstance.RutaIdInput = this.Ruta.ruta;
    modalRef.componentInstance.RutaNombreInput = this.Ruta.ruta;
    modalRef.componentInstance.DayNumberInput = DayNumber;

    modalRef.result.then((result: any) => {
      this.loadSchedules(false);
    }).catch(error => { });
  }

  editSchedule(day:string, DayNumber:number, scheduleId:string, from:string, to:string ){
    const modalRef = this.modalService.open(EditarHorarioComponent, { centered: true, scrollable: true, backdrop: 'static',size: 'md' });
    modalRef.componentInstance.DayInput = day;
    modalRef.componentInstance.IsEditingInput = true;
    modalRef.componentInstance.RutaIdInput = this.Ruta.ruta;
    modalRef.componentInstance.ScheduleIdInput = scheduleId;
    modalRef.componentInstance.ScheduleFromInput = from;
    modalRef.componentInstance.ScheduleToInput = to;
    modalRef.componentInstance.RutaNombreInput = this.Ruta.ruta;
    modalRef.componentInstance.DayNumberInput = DayNumber;

    modalRef.result.then((result: any) => {
      this.loadSchedules(false);
    }).catch(error => { });
  }

  loadSchedules(showSpinner:boolean=true){
    if(showSpinner){
      this.spinner.show();
    }
    
    this.route.paramMap.subscribe((params) => {
      let request: Observable<any>;
      request = this.horariosService.getScheduleByRoute(this.Ruta.ruta);
      request.subscribe(
        (schedules_result) =>{
          if (schedules_result.length) {
            this.processSchedules(schedules_result);
            if(showSpinner){
              this.spinner.hide();
            }
          }
        }
      );
    })
  }

  processSchedules(schedules_all:any){
    schedules_all.forEach((schedule:any) => {
      switch(schedule.diaSemana){

        case 1:
          this.schedules.monday = this.formatSchedules(schedule.horarios);
          break;

          case 2:
          this.schedules.tuesday = this.formatSchedules(schedule.horarios);
          break;

          case 3:
          this.schedules.wednesday = this.formatSchedules(schedule.horarios);
          break;

          case 4:
          this.schedules.thursday = this.formatSchedules(schedule.horarios);
         break;

          case 5:
          this.schedules.friday = this.formatSchedules(schedule.horarios);
          break;

          case 6:
          this.schedules.saturday = this.formatSchedules(schedule.horarios);
          break;

          case 7:
          this.schedules.sunday = this.formatSchedules(schedule.horarios);
          break;
      }
    });
    console.log(this.schedules);
  }

  formatSchedules(schedule_arr:any){
    schedule_arr.forEach((schedule:any) => {
      schedule.inicio = schedule.inicio.substring(0,5);
      schedule.fin = schedule.fin.substring(0,5);
    });

    return schedule_arr;
  }

  askForRemoveSchedule(scheduleId:string, schedule:any){
    Swal.fire({
      title: '¿Deseas eliminar este horario?',
      icon: 'question',
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeSchedule(scheduleId,schedule);
      } 
    })
  }
  
  removeSchedule(scheduleId:string, schedule:any){
    // this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      let request: Observable<any>;
      request = this.horariosService.deleteSchedule(scheduleId);
      request.subscribe(
        (result) =>{
          //this.toastrService.success('Horario eliminado correctamente');
          this.toastrService.success('Horario eliminado correctamente','Realizado');
          let el = document.getElementById("table-horarios") as HTMLDivElement;
          el.classList.add("table-responsive-no-scroll");
          schedule.deleted = true;
          this.loadSchedules(false);
          el.classList.remove("table-responsive-no-scroll");
        },
        (error =>{
          const message = error.error.errorMessages;
          this.toastrService.error(message,'Ocurrió un error');
        })
      );
    })
  }

}
