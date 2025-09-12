import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HorariosService } from 'src/app/services/horarios.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-horario',
  templateUrl: './editar-horario.component.html',
  styleUrls: ['./editar-horario.component.scss']
})
export class EditarHorarioComponent implements OnInit {

  @ViewChild("first") inputToFocus: ElementRef;
  
  @Input() DayInput:any;
  @Input() IsEditingInput:boolean;
  @Input() ScheduleInput:any;
  @Input() RutaIdInput:string;
  @Input() RutaNombreInput:string;
  @Input() DayNumberInput:number;
  @Input() ScheduleIdInput:string;
  @Input() ScheduleFromInput:string;
  @Input() ScheduleToInput:string;

  Day:string;
  IsEditing:boolean;
  From:any;
  RutaId:string;
  DayNumber:number;
  RutaNombre:string;
  ScheduleId:string;
  ScheduleFrom:string;
  ScheduleTo:string;

  form: FormGroup;
  
  constructor(public modal: NgbActiveModal, private toastrService: ToastrService, 
              private horariosService:HorariosService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadData();
    this.initForm();
  }

  loadData():void{
    this.Day = this.DayInput;
    this.IsEditing = this.IsEditingInput;
    this.RutaId = this.RutaIdInput;
    this.RutaNombre = this.RutaNombreInput;
    this.DayNumber = this.DayNumberInput;
    
    if(this.IsEditing){
      this.ScheduleId = this.ScheduleIdInput;
      this.ScheduleFrom = this.ScheduleFromInput;
      this.ScheduleTo = this.ScheduleToInput;
    }
  }

  private initForm(): void {
    this.form = new FormGroup({
      From: new FormControl(this.ScheduleFrom ? this.ScheduleFrom : null, Validators.required),
      To: new FormControl(this.ScheduleTo ? this.ScheduleTo : null, Validators.required),
    });

    if(this.IsEditing){

    }
  }

  validateKeyPressTime(event:any){
    var key = event.keyCode || event.charCode;

    if(key != 8 && key != 46 && isNaN(String.fromCharCode(event.which) as any)){
      event.preventDefault();
    }
  }

 validateKeyUpTime(event:any, input:any)
{
    var result = "";
    var key = event.keyCode || event.charCode;

    if( key != 8 && key != 46 ){
        if(event.target.value.length == 2){

            if(Number(event.target.value) > 23){
              event.target.value = "23";
            }

            event.target.value = event.target.value + ':';
        }

        if(event.target.value.length == 5){
            var minutos = event.target.value.split(":")[1];
            if(Number(minutos) > 59){
              event.target.value = event.target.value.split(":")[0] + ":59"; 
            }

            if (event.target.value.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)){
                this.form.controls[input].setErrors(null);
            }
            else{
                this.form.controls[input].setErrors({'incorrect': true});
            }

            if(event.target.value.includes(" ")){
              this.form.controls[input].setErrors({'incorrect': true});
            }
        }

        if(event.target.value.length > 5){
            event.target.value = event.target.value.substring(0,5);
        }
    }
  }

  editOrSaveSchedule(){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let fromValue = this.form.value.From;

    if(fromValue.length == 6){
      fromValue = fromValue.substring(0,5);
    }

    let  toValue = this.form.value.To;

    if(toValue.length == 6){
      toValue = toValue.substring(0,5);
    }

    if(fromValue && !fromValue.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)){
      this.form.controls["From"].setErrors({'incorrect': true});
    }

    if(toValue && !toValue.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)){
      this.form.controls["To"].setErrors({'incorrect': true});
    }

    if(!this.IsEditing){
      this.saveSchedule(fromValue,toValue);
    }
    else{
      this.updateSchedule(fromValue,toValue);
    }
  }

  saveSchedule(from:string, to:String){
    const schedule = {
      "ruta": this.RutaId,
      "diaSemana": this.DayNumber,
      "inicio": from ? from + ":00"  : "00:00:00",
      "fin":  to ? to + ":00" : "00:00:00"
    };

    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.horariosService.saveSchedule(schedule);

      peticion.subscribe(
        (saveSchedule_result =>{
          if(!this.IsEditing){
            this.toastrService.success('Se asignó el horario para la ruta '+this.RutaNombre,'Realizado');
          }
          else{
            this.toastrService.success('Se actualizó el horario para la ruta '+this.RutaNombre,'Realizado');
          }
          
          this.modal.close(saveSchedule_result);
        }),
        (error =>{
          const message = error.error.errorMessages;
          this.toastrService.error(message,'Ocurrió un error');
        })
      );
    });
  }

  updateSchedule(from:string, to:String){
    this.route.paramMap.subscribe((params) => {
      let request: Observable<any>;
      request = this.horariosService.deleteSchedule(this.ScheduleIdInput);
      request.subscribe(
        (result) =>{
          this.saveSchedule(from,to);
        },
        (error =>{
          const message = error.error.errorMessages;
          this.toastrService.error(message,'Ocurrió un error');
        })
      );
    })
  }

}
