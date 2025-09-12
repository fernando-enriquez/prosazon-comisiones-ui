import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApinayarbotService } from "../../../../services/northwareUtils.service";
import { ActivatedRoute } from "@angular/router";
import Swal from 'sweetalert2';
import { PeticionesService } from "../../../../services/peticiones.service"
import { Subscription } from 'rxjs';

/**
 * Interfaz usuario con sus propiedades y tipos.
 */
 export interface dataUsuario {
  idUsuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

@Component({
  selector: 'app-asignarusuariospermisosmodal',
  templateUrl: './asignarusuariospermisosmodal.component.html',
  styleUrls: ['./asignarusuariospermisosmodal.component.scss']
})
export class AsignarusuariospermisosmodalComponent implements OnInit, OnDestroy {

  usuarios: any; // Variable para asignar todos los registros de usuarios
  usuariosasignados: any; // Variable para asignar todos los registros de usuarios asignados al perfil 

  users = new Set<dataUsuario>(); // Variable para asignar registros de usuarios a mostrar en tabla usuarios
  usuariosAsignadoss = new Set<dataUsuario>(); // Variable para asignar registros de usuarios asignados a mostrar en tabla usuarios asignados
  usuariosAsignadossFilter = new Set<dataUsuario>(); // Variable para asignar registros de tabla usuarios asignados
  usuariosNoAsignadossFilter = new Set<dataUsuario>(); // Variable para asignar registros de tabla usuarios no asignados
  clickedRowsU = new Set<dataUsuario>(); // Variable para asignar registros seleccionados de tabla usuarios
  clickedRowsUA = new Set<dataUsuario>(); // Variable para asignar registros seleccionados de tabla usuarios asignados

  buscarUsuarios = false;
  buscarUsuariosA = false;

  perfil: any;

  /** Variable de formulario perfil*/
  perfilform = null;

  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(public modal: NgbActiveModal,
    private apinayarbotService: ApinayarbotService,
    private route: ActivatedRoute,
    public peticionesService: PeticionesService) { }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  ngOnInit(): void {
    this.perfilform = this.perfil.nombre;
    this.usuariosPerfilT();
  }

  /**
   * Función filtro de busqueda en la tabla usuarios perfil
   * @param event 
  */
  applyFilterUsuarios(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarUsuarios = false;
    } else {
      this.buscarUsuarios = true;
    }
    this.users.clear();
    if (this.usuarios.length > 0) {
      for (let index = 0; index < this.usuarios.length; index++) {
        this.users.add(this.usuarios[index]);
      }
    }

    let nuevo = new Set<dataUsuario>();
    if (this.users.size != 0) {
      this.users.forEach(element => {
        if (element.idUsuario.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          nuevo.add(element);
        }
        if (element.nombres != null) {
          if (element.nombres.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
        if (element.apellidoPaterno != null) {
          if (element.apellidoPaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
        if (element.apellidoMaterno != null) {
          if (element.apellidoMaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.users.clear();
      nuevo.forEach(element => {
        this.users.add(element);
      });
    } else {
      this.users.clear();
    }
  }

  /**
   * Función filtro de busqueda en la tabla usuarios perfil asignados
   * @param event 
  */
  applyFilterUsuariosA(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.buscarUsuariosA = false;
    } else {
      this.buscarUsuariosA = true;
    }
    this.usuariosAsignadoss.clear();
    if (this.usuariosAsignadossFilter.size != 0) {
      this.usuariosAsignadossFilter.forEach(element => {
        this.usuariosAsignadoss.add(element);
      });
    }

    let nuevo = new Set<dataUsuario>();
    if (this.usuariosAsignadoss.size != 0) {
      this.usuariosAsignadoss.forEach(element => {
        if (element.idUsuario.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
          nuevo.add(element);
        }
        if (element.nombres != null) {
          if (element.nombres.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
        if (element.apellidoPaterno != null) {
          if (element.apellidoPaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
        if (element.apellidoMaterno != null) {
          if (element.apellidoMaterno.trim().toLowerCase().includes(filterValue.trim().toLowerCase())) {
            nuevo.add(element);
          }
        }
      });
    }

    if (nuevo.size != 0) {
      this.usuariosAsignadoss.clear();
      nuevo.forEach(element => {
        this.usuariosAsignadoss.add(element);
      });
    } else {
      this.usuariosAsignadoss.clear();
    }
  }

  /**
   * Función agregar o quitar registro seleccionado con el evento click
   * de tabla usuarios perfil al conjunto clickedRowsU
   * @param {dataUsuario} row Parametro registro de la tabla usuarios perfil evento click
   */
  clickedRowsLU(row: dataUsuario) {
    let eliminar = 0;
    this.clickedRowsU.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsU.delete(row);
    } else {
      this.clickedRowsU.add(row);
    }
  }

  /**
  * Función agregar o quitar registro seleccionado con el evento click
  * de tabla usuarios perfil asignados al conjunto clickedRowsUA
  * @param {dataUsuario} row Parametro registro de la tabla usuarios perfil asignados evento click
  */
  clickedRowsLUA(row: dataUsuario) {
    let eliminar = 0;
    this.clickedRowsUA.forEach(element => {
      if (element == row) {
        eliminar = 1;
      }
    });
    if (eliminar === 1) {
      this.clickedRowsUA.delete(row);
    } else {
      this.clickedRowsUA.add(row);
    }
  }

  /**
 * Función agregar todos los registros de tabla usuarios perfil a tabla usuarios perfil asignados
 */
  allright() {
    if (this.buscarUsuarios) {
      if (this.buscarUsuariosA) {
        let nuevo = new Set<dataUsuario>();
        if (this.usuariosAsignadossFilter.size != 0) {
          this.users.forEach(element => {
            this.usuariosAsignadossFilter.forEach(element2 => {
              if (element.idUsuario != element2.idUsuario) {
                nuevo.add(element);
              }
            });
          });
        }

        nuevo.forEach(element => {
          this.usuariosAsignadoss.add(element);
          this.usuariosAsignadossFilter.add(element);
        });
        this.clickedRowsU.clear();
      } else {
        let nuevo = new Set<dataUsuario>();
        if (this.usuariosAsignadoss.size != 0) {
          this.users.forEach(element => {
            this.usuariosAsignadoss.forEach(element2 => {
              if (element.idUsuario != element2.idUsuario) {
                nuevo.add(element);
              }
            });
          });
        }

        nuevo.forEach(element => {
          this.usuariosAsignadoss.add(element);
          this.usuariosAsignadossFilter.add(element);
        });
        this.clickedRowsU.clear();
      }
    } else {
      this.usuariosAsignadoss.clear();
      this.users.forEach(element => {
        this.usuariosAsignadoss.add(element)
      });
      this.clickedRowsU.clear();

      this.usuariosAsignadossFilter.clear();
      this.usuariosAsignadoss.forEach(element => {
        this.usuariosAsignadossFilter.add(element);
      });
    }
  }

  /**
   * Función quitar todos los registros de tabla usuarios perfil asignados
   */
  allleft() {
    if (this.buscarUsuariosA) {
      this.usuariosAsignadoss.forEach(element => {
        this.usuariosAsignadossFilter.delete(element);
      });
      this.usuariosAsignadoss.clear();
      this.clickedRowsUA.clear();
    } else {
      this.usuariosAsignadoss.clear();
      this.usuariosAsignadossFilter.clear();
      this.clickedRowsUA.clear();
    }
  }

  /**
   * Función agregar uno o varios registros seleccionados de tabla usuarios perfil
   * a tabla usuarios perfil asignados
   */
  multipleright() {
    if (this.buscarUsuarios) {
      if (this.usuariosAsignadoss.size != 0) {
        this.clickedRowsU.forEach(element => {
          this.usuariosAsignadoss.forEach(element2 => {
            if (element.idUsuario == element2.idUsuario) {
              this.clickedRowsU.delete(element);
            }
          });
        });
      }
      this.clickedRowsU.forEach(element => {
        this.usuariosAsignadoss.add(element);
      });
      this.clickedRowsU.clear();

      this.usuariosAsignadoss.forEach(element => {
        this.usuariosAsignadossFilter.add(element);
      });
    } else {
      if (this.usuariosAsignadoss.size != 0) {
        this.clickedRowsU.forEach(element => {
          this.usuariosAsignadoss.forEach(element2 => {
            if (element.idUsuario == element2.idUsuario) {
              this.clickedRowsU.delete(element);
            }
          });
        });
      }
      this.clickedRowsU.forEach(element => {
        this.usuariosAsignadoss.add(element);
      });
      this.clickedRowsU.clear();

      this.usuariosAsignadossFilter.clear();
      this.usuariosAsignadoss.forEach(element => {
        this.usuariosAsignadossFilter.add(element);
      });
    }
  }

  /**
   * Función quitar uno o varios registros seleccionados de tabla usuarios perfil asignados
   */
  multipleleft() {
    this.clickedRowsUA.forEach(element => {
      this.usuariosAsignadoss.delete(element);
      this.usuariosAsignadossFilter.delete(element);
    });
    this.clickedRowsUA.clear();
  }

  /**
    * Función guardar usuarios asignar de perfil desde api service.
    */
  guardarAsignarUsuarios() {
    let nuevo = new Set<string>();
    if (this.usuariosAsignadoss.size != 0) {
      this.usuariosAsignadoss.forEach(element => {
        nuevo.add(element.idUsuario);
      });
    }

    let res;
    if (nuevo.size === 0) {
      res = null;
    } else {
      res = Array.from(nuevo)
    }

    this.modal.close(res);
  }

  /**
 * Función obtener usuarios del perfil desde api service y visualizar en tabla usuarios perfil
 */
  usuariosPerfilT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.usuariosPerfilT();
    });
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getUsuariosPerfil(this.perfil.idPerfil).subscribe(
          (usuarios_result) => {
            this.usuarios = usuarios_result;
            this.peticionesService.onCancelPendingRequests();
            if (this.usuarios.length > 0) {
              for (let index = 0; index < this.usuarios.length; index++) {
                this.users.add(this.usuarios[index]);
              }
            }
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
                confirmButtonColor: '#5E72E4',
                iconColor: '#510A00',
              });
            } else if (err.status === 403) {
              Swal.fire({
                icon: 'info',
                title: 'Usuarios por perfil',
                text: err.error.errorMessages,
                confirmButtonColor: '#5E72E4',
                iconColor: '#5E72E4',
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

}
