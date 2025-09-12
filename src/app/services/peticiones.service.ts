import { Injectable } from '@angular/core';
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PeticionesService {

  private peticionSource = new Subject<string>();

  //Observable string streams
  peticion$ = this.peticionSource.asObservable();

  // Service message commands
  notificarCambioToken(req: any) {
    this.peticionSource.next(req);
  }

  public onCancelPendingRequests() {
    this.peticionSource = new Subject<string>();
    this.peticion$ = this.peticionSource.asObservable();
  }

}
