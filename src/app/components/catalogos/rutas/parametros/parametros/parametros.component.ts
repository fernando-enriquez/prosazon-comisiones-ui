import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AtributosServiceService } from 'src/app/services/atributos-service.service';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.scss']
})
export class ParametrosComponent implements OnInit {

  @ViewChild("first") inputToFocus: ElementRef;
  
  @Input() RutaInput:any;

  MaxTimeCommit:string;
  MaxTimeDelivery:string;
  RutaId:string;
  RutaNombre:string;
  isLoading = false;
  form: FormGroup;
  Ruta:any;
  
  constructor(
    private spinner: NgxSpinnerService,
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private attributesService:AtributosServiceService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadAttributes();
    this.initForm();
  }

  private initForm(): void {
    this.form = new FormGroup({
      MaxTimeCommit: new FormControl(this.MaxTimeCommit ? this.MaxTimeCommit : null, Validators.required),
      MaxTimeDelivery: new FormControl(this.MaxTimeDelivery ? this.MaxTimeDelivery : null, Validators.required),
    });
  }

  private loadData():void {
    console.log(this.RutaInput);
    this.Ruta = this.RutaInput;
    this.RutaId = this.RutaInput.ruta;
    this.RutaNombre = this.RutaInput.ruta;
  }

  private loadAttributes(){
    this.route.paramMap.subscribe((params) => {
      let request: Observable<any>;
      request = this.attributesService.getAttributesByRoute(this.RutaId);
      request.subscribe(
        (attributes_result) =>{
          if (attributes_result.length) {
            this.MaxTimeCommit = attributes_result.Confirmacion;
            this.MaxTimeDelivery = attributes_result.Entrega;
          }
        }
      );
    })
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

    SaveParams(){
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      let commitValue = this.form.value.MaxTimeCommit;

      if(commitValue.length == 6){
        commitValue = commitValue.substring(0,5);
      }

      let deliveryValue = this.form.value.MaxTimeDelivery;

      if(deliveryValue.length == 6){
        deliveryValue = deliveryValue.substring(0,5);
      }

      if(commitValue && !commitValue.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)){
        this.form.controls["MaxTimeCommit"].setErrors({'incorrect': true});
      }

      if(deliveryValue && !deliveryValue.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)){
        this.form.controls["MaxTimeDelivery"].setErrors({'incorrect': true});
      }

      const attributes = {
        "ruta": this.RutaId,
        "entrega": commitValue ? commitValue + ":00"  : "00:00:00",
        "confirmacion":  deliveryValue ? deliveryValue + ":00" : "00:00:00"
      };

      
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.attributesService.saveAttributes(attributes);

        peticion.subscribe(
          (saveParams_result =>{
            this.toastrService.success('Se actualizó el horario para la ruta '+this.RutaNombre,'Realizado');
            this.modal.close(saveParams_result);
          }),
          (error =>{
            const message = error.error.errorMessages;
            this.toastrService.error(message,'Ocurrió un error');
          })
        );
      });
    }

}
