import { Component, OnInit } from '@angular/core';
import { NorthwareUtilsService } from 'src/app/services/northwareUtils.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-general-setup',
  templateUrl: './general-setup.component.html',
  styleUrls: ['./general-setup.component.scss']
})
export class GeneralSetupComponent implements OnInit {

  balAccountType:string;
  balAccountNum:string;
  id:string;

  constructor(
    private apiService: NorthwareUtilsService,
  ) { }

  ngOnInit(): void {
    this.setConfigurationValues();
  }

  async setConfigurationValues(){
    var data = await this.getValues();
    if(data){
      this.balAccountType = data.balAccountType;
      this.balAccountNum = data.balAccountNumber;
      this.id = data.id;
    }
  }

  async getValues():Promise<any>
  {
    try{
      return new Promise((resolve, reject ) => {
        this.apiService.getGeneralSetup().subscribe({
          next:(data) => resolve(data),
          error:(error) => reject(error)
        });
      });
    }
    catch(ex){

    }
  }

  save(){
    var data = {
      Id:this.id,
      BalAccountType:this.balAccountType,
      BalAccountNumber:this.balAccountNum
    };
    try{
      this.apiService.saveGeneralSetup(data).subscribe({
        next:(data) => {
          Swal.fire({
                icon: 'success',
                title: 'Asignaciones actualizadas',
                text: '',
                });
        },
        error:(error) => {
          Swal.fire({
                icon: 'warning',
                title: 'Algo salió mal',
                text: 'Contacte al administrador para solucionar el problemna',
                });
        }
      });
    }
    catch(ex){

    }
  }
}
