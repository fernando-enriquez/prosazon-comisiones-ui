import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NorthwareUtilsService } from 'src/app/services/northwareUtils.service';
import { PeticionesService } from 'src/app/services/peticiones.service';
import Swal from 'sweetalert2';
import { debounceTime, switchMap, tap, finalize, Subject, Observable, of, skip } from 'rxjs';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { assign } from 'underscore';

@Component({
  selector: 'app-asignacion-empleado',
  templateUrl: './asignacion-empleado.component.html',
  styleUrls: ['./asignacion-empleado.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AsignacionEmpleadoComponent implements OnInit {

  employeeList:any = [];
  employeeListPaginated:any = [];
  selectedEmployee:any = [];
  dropdownSettings: any = {};
  customerList:any = [];
  branchOfficeList:any = [];
  filter:any =
  {
    PageNumber:1,
    PageSize:20,
    EmployeeIds:[]
  }

  enableEditing:boolean = false;


  dropdownData: any = []; // List of options
  loading = false;
  search$ = new Subject<string>(); // Search query stream


  constructor(  private spinner: NgxSpinnerService, 
                private apiService: NorthwareUtilsService, 
                private route: ActivatedRoute, 
                public requestService: PeticionesService ) 
                {
                }

  ngOnInit(): void {
    this.getAllEmployee();
    this.getAllEmployeePaginated();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'fullName',
      enableCheckAll: false,
      itemsShowLimit: 9,
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    this.selectedEmployee.push(item.id);
    console.log(this.selectedEmployee);
}

  onItemDeSelect(item: any) {
    const index = this.selectedEmployee.indexOf(item.id);
    if (index !== -1) {
      this.selectedEmployee.splice(index, 1);
    }

    console.log(this.selectedEmployee);
  }

       setEnableEditing(enable:boolean)
       {
         if(enable == true)
         {
           Swal.fire({
             title: "Editar la lista",
             text: "¿Deseas editar la lista de asignaciones de empleados?",
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

  async saveEmployeeAsignation()
  {
    let assignmentEmployeeList:any = [];
    //we loop through the array of employees and only we procces those that have all his data completed
    this.employeeListPaginated.forEach(employee => {
      employee.reason = null;
      if(employee.customerSelected == null || employee.branchOfficeSelected == null || employee.beginPeriod == null || employee.endPeriod == null){
        return;
      }

      //first create the period assignations given the dates
      let begin = employee.beginPeriod.split("-");
      let end = employee.endPeriod.split("-");

      var assignmentObj = {
        EmployeeId: employee.id,
        BranchOffice: employee.branchOfficeSelected,
        BeginDate:new Date(begin[0], begin[1]-1, begin[2]),
        EndDate:new Date(end[0], end[1]-1, end[2])
      };
      assignmentEmployeeList.push(assignmentObj);
    });

    //send the list to save
    var dataToSend = {
      Assignments:assignmentEmployeeList
    };

    var result:any = await this.saveAssignmentList(dataToSend); 

    if(result.success == true){
    this.enableEditing = false;
      Swal.fire({
      icon: 'success',
      title: 'Asignaciones actualizadas',
      text: '',
      });
    }
    else{
      Swal.fire({
      icon: 'warning',
      title: 'No todas las asignaciones se realizaron',
      text: 'Vea los detalles para mas información',
      });
      debugger;
      this.employeeListPaginated.forEach(element => {
       var assignmentResult = result.results.filter(x => x.employeeCode == element.id); 
       if(assignmentResult.length > 0){
        element.reason = assignmentResult[0].reason
        element.success = assignmentResult[0].success
       }
      });
    }
  }

  createAssignmentPeriods(begin:Date, end:Date):any
  {
    //based on begin and end dates, we create the periods
    //begin date is the base of this
    //to complete a period we add 7 days to get sunday
    //and we repeat until the end of period equals to endDate
    let periods = [];

    //we this process until begin date reachs end date
    while(begin < end)
    {
      //get monday
      //we use a while to add days to begin date until we reach monday
      //the first time, "begin" its always monday
       while(begin.getDay() != 1)
        {
          begin.setDate(begin.getDate() + 1);
        }

        //Correct way: Create a UTC date without local timezone interference
        let mondayDate: Date = new Date(begin);
        

        //then we have to add days until we reach the next sunday date
        while(begin.getDay() != 0)
        {
          begin.setDate(begin.getDate() + 1);
        }
         //we set sunday
         let sundayDate: Date = new Date(begin);

         //we create the assignment object
         //add the period
        let period:Period = {
        Id:0,
        Text: "",
        Begin:mondayDate,
        End:sundayDate
        }
        
        periods.push(period);
    }

    return periods;
  }

  async getAllEmployee(): Promise<void>{
    try {
      this.employeeList = [];
      this.spinner.show();
      this.route.paramMap.subscribe(
        (params) => {
          this.apiService.getEmployee().subscribe(
            (data) => {
              this.employeeList = data;
              this.spinner.hide();
            },
            (err) => {
              if (err.status != 401) {
                this.requestService.onCancelPendingRequests();
              }
              if (err.status === 500) {
                Swal.fire({
                  icon: 'error',
                  title: err.statusText,
                  text: 'Ocurrió un error en el servidor',
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

  async getAllEmployeePaginated(): Promise<void>{
    try {
      this.employeeListPaginated = [];
      this.filter.EmployeeIds = this.selectedEmployee;
      this.spinner.show();
      this.route.paramMap.subscribe(
        (params) => {
          this.apiService.getEmployeePaginated(this.filter).subscribe(
            (data:any) => {
              this.employeeListPaginated = data.employees;
              this.employeeListPaginated = this.employeeListPaginated.map(emp => ({
                ...emp,
                customerSelected: emp.customerSelected ?? null,
                branchOfficeSelected:emp.branchOfficeSelected ?? null,
                branchOfficeList:emp.branchOfficeList,
                beginPeriod:emp.beginPeriod != "0001-01-01T00:00:00" ? emp.beginPeriod.split("T")[0] : null,
                endPeriod:emp.endPeriod != "0001-01-01T00:00:00" ? emp.endPeriod.split("T")[0] : null
              }));
              
              this.spinner.hide();
            },
            (err) => {
              if (err.status != 401) {
                this.requestService.onCancelPendingRequests();
              }
              if (err.status === 500) {
                Swal.fire({
                  icon: 'error',
                  title: err.statusText,
                  text: 'Ocurrió un error en el servidor',
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
  

  onSearch(searchTerm: any) {
    console.log(searchTerm);
    if (searchTerm.term.length < 3) {
      this.dropdownData = [];
      return;
    }

    this.loading = true;
    this.fetchData(searchTerm.term);
  }

  fetchData(searchTerm: string) {
    console.log('Fetching data for:', searchTerm);
    if (!searchTerm){
      this.dropdownData = [];
    }

    this.route.paramMap.subscribe(
      (params) => {
        this.apiService.getCustomers(searchTerm).subscribe(
          (data) => {
              this.dropdownData = data;
              this.loading = false;
          },
          (err) => {
            if (err.status != 401) {
              this.requestService.onCancelPendingRequests();
            }
            if (err.status === 500) {
              Swal.fire({
                icon: 'error',
                title: err.statusText,
                text: 'Ocurrió un error en el servidor',
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

  //this method is intended for set a list of branchOffices to every employee row according to its selected customer
  //receives a full employee record included the selected customer
  async onCustomerChange(record: any) {
    try{
      //we get the data from api
      const data = await this.getBranchOfficeByCustomer(record.customerSelected.id);
      console.log(data);
      //then we find the record in the employeeList and we set the branchOfficeList
      const employeeIndex = this.employeeListPaginated.findIndex(x => x.id == record.id);
      if(employeeIndex > -1){
        debugger;
        this.employeeListPaginated[employeeIndex].branchOfficeList = data;
      }
    }
    catch(error){
      console.error("Error:", error);
    }    
  }

  getBranchOfficeByCustomer(customerId):Promise<any>{
    return new Promise((resolve,reject) => {
      this.apiService.getBranchOfficeByCustomer(customerId).subscribe({
        next: (data) => resolve(data), 
        error: (error) => reject(error)
      });
    })
  }

  saveAssignmentList(assignmentList){
    return new Promise((resolve,reject) => {
      this.apiService.saveAssignmentList(assignmentList).subscribe({
        next: (data) => resolve(data), 
        error: (error) => reject(error)
      });
    });
  }
}

export interface Period
{
  Id:number;
  Text:string;
  Begin:Date;
  End:Date;
};
