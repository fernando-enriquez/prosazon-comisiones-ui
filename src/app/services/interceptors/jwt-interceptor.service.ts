import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiauthenticationService } from "../../services/apiauthentication.service";
import { catchError } from 'rxjs/operators';
import { PeticionesService } from "../peticiones.service"

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

  public user: any;

  constructor(private router: Router, private apiauthenticationService: ApiauthenticationService, private route: ActivatedRoute, private peticionesService: PeticionesService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');
    let req = request;
    if (token) {
      req = request.clone({
        setHeaders: {
          authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          if (localStorage.getItem('refreshToken')) {
            const refreshtoken = {
              "RefreshToken": localStorage.getItem('refreshToken')
            };
            this.route.paramMap.subscribe((params) => {
              let peticion: Observable<any>;
              peticion = this.apiauthenticationService.postAuthenticationRefresh(refreshtoken);
              peticion.subscribe(
                (user_result) => {
                  this.user = user_result;
                  if (this.user) {
                    const accessToken = this.user.accessToken;
                    const refreshToken = this.user.refreshToken;
                    this.apiauthenticationService.guardarToken(accessToken, refreshToken);
                    this.apiauthenticationService.leerToken();
                    this.peticionesService.notificarCambioToken("");
                  }
                },
                (err) => {
                  this.apiauthenticationService.logout();
                  this.router.navigateByUrl('/principal/login');
                }
              );
            });
          }
        }

        return throwError(err);

      })
    );
  }
}
