import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NorthwareUtilsService {
  SERVER_API: string = environment.SERVER_API;

  constructor(private http: HttpClient) { }

  public postProveedores(proveedores: any) {
    return this.http.post(`${this.SERVER_API}/suppliers`, proveedores);
  }

  public getProveedores(query: any) {
    return this.http.post(`${this.SERVER_API}/suppliers/search`,query);
  }

  public getEmployee() {
    return this.http.get(`${this.SERVER_API}/Employee`);
  } 

  public getEmployeePaginated(filter:any)
  {
    return this.http.post(`${this.SERVER_API}/Employee/GetAllEmployeePaginated`, filter);
  }
  
  public getAsignaciones(filter:any) {
    return this.http.post(`${this.SERVER_API}/Assignment/get`, filter);
  } 

  public getListaAsistencia() {
    return this.http.get(`${this.SERVER_API}/AttendanceSheet`);
  } 

  public getTiposAsignacion()
  {
    return this.http.get(`${this.SERVER_API}/AttendanceType`);
  }

  public getCustomers(search:string){
    return this.http.get(`${this.SERVER_API}/Customer?search=${search}`);
  }

  public getBranchOfficeByCustomer(customerId:string){
    return this.http.get(`${this.SERVER_API}/BranchOffice?customerId=${customerId}`);
  }

  public saveAssignmentList(assignmentList:any){
    return this.http.post(`${this.SERVER_API}/Assignment`, assignmentList);
  }

  public getGeneralSetup(){
    return this.http.get(`${this.SERVER_API}/GeneralSetup`);
  }

  public saveGeneralSetup(data:any){
    return this.http.post(`${this.SERVER_API}/GeneralSetup`,data);
  }
}
