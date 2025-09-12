import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Observable } from 'rxjs';
import { PeticionesService } from "../../../services/peticiones.service"
import { Subscription } from 'rxjs';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AsignarusuariospermisosmodalComponent } from "./asignarusuariospermisosmodal/asignarusuariospermisosmodal.component";
import { TreeService } from 'src/app/services/tree.service';

export class moduloNode {
  constructor(
    public expandable: boolean,
    public nombre: string,
    public idModulo: string,
    public descripcion: string,
    public moduloPadre: string,
    public level: number,
    public agregar: boolean,
    public borrar: boolean,
    public modificar: boolean,
    public ver: boolean) { }
}

export class modulo {
  idModulo: string;
  nombre: string;
  descripcion: string;
  moduloPadre: string;
  children?: modulo[] | any[];
  agregar: boolean;
  borrar: boolean;
  modificar: boolean;
  ver: boolean;
}

@Component({
  selector: 'app-modulospermisos',
  templateUrl: './modulospermisos.component.html',
  styleUrls: ['./modulospermisos.component.scss']
})
export class ModulospermisosComponent implements OnInit, OnDestroy {

  tree: any;

  displayedColumns: string[] = ['name', 'add', 'delete', 'update', 'get'];

  treeControl: FlatTreeControl<moduloNode>;
  treeFlattener: MatTreeFlattener<modulo, moduloNode>;
  dataSource: MatTreeFlatDataSource<modulo, moduloNode>;

  form = false;
  newM = false;
  showM = false;
  editM = false;

  nombre = null;
  moduloPadre = null;
  descripcion = null;
  idModuloPadre = null;
  idModulo = null;

  modificar = false;

  perfil: any;
  usuario: any;
  usuarioStatus = false;

  postpermisos: any = [];

  private _subscriptionPeticion: Subscription;

  constructor(private apinayarbotService: ApinayarbotService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private router: Router,
    public peticionesService: PeticionesService,
    private modalService: NgbModal) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel, this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<moduloNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }


  hasChild = (_: number, _nodeData: moduloNode) => _nodeData.expandable;

  transformer = (node: modulo, level: number) => {
    return new moduloNode(!!node.children, node.nombre, node.idModulo, node.descripcion, node.moduloPadre, level, node.agregar, node.borrar, node.modificar, node.ver);
  }

  private _getLevel = (node: moduloNode) => node.level;

  private _isExpandable = (node: moduloNode) => node.expandable;

  private _getChildren = (node: modulo) => node.children;

  ngOnInit(): void {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.ngOnInit();
    });
    let tipo = this.route.snapshot.paramMap.get('tipo');
    let id = this.route.snapshot.paramMap.get('id');
    if (tipo === 'usuarios') {
      this.usuarioStatus = true;
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getUsuarioId(id).subscribe(
            (usuario_result) => {
              this.usuario = usuario_result;
              this.peticionesService.onCancelPendingRequests();
              if (this.usuario === null) {
                this.router.navigate(['/catalogos/' + tipo]);
              } else {
                this.permisosT();
              }
            },
            (err) => {
              console.log(err);
              if (err.status != 401) {
                this.peticionesService.onCancelPendingRequests();
              }
              this.router.navigate(['/catalogos/' + tipo]);
            }
          );
        },
        () => { }
      );
    } else {
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getPerfilId(id).subscribe(
            (perfil_result) => {
              this.perfil = perfil_result;
              this.peticionesService.onCancelPendingRequests();
              if (this.perfil === null) {
                this.router.navigate(['/catalogos/' + tipo]);
              } else {
                this.permisosT();
              }
            },
            (err) => {
              console.log(err);
              if (err.status != 401) {
                this.peticionesService.onCancelPendingRequests();
              }
              this.router.navigate(['/catalogos/' + tipo]);
            }
          );
        },
        () => { }
      );
    }
  }

  permisosT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.permisosT();
    });
    this.spinner.show();
    var permisos: any;
    if (this.usuario != undefined) {
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getAsignacionPermisosUsuario(this.usuario.idUsuario, "").subscribe(
            (permisos_result) => {
              permisos = permisos_result;
              this.peticionesService.onCancelPendingRequests();
              if (permisos.length > 0) {
                this.tree = new TreeService(permisos[0].idModulo, permisos[0]);
                this.onExpand(permisos[0]);
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
                  title: err.statusText,
                  text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
                  confirmButtonColor: '#5E72E4',
                  iconColor: '#510A00',
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
    } else {
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getAsignacionPermisosPerfil(this.perfil.idPerfil, "").subscribe(
            (permisos_result) => {
              permisos = permisos_result;
              this.peticionesService.onCancelPendingRequests();
              if (permisos.length > 0) {
                this.tree = new TreeService(permisos[0].idModulo, permisos[0]);
                this.onExpand(permisos[0]);
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
                  title: err.statusText,
                  text: 'VERIFICAR CONEXIÓN A INTERNET O SERVIDOR',
                  confirmButtonColor: '#5E72E4',
                  iconColor: '#510A00',
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
    }
  }

  onExpand(node: any) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.onExpand(node);
    });
    var permisoshijos: any;
    if (this.usuario != undefined) {
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getAsignacionPermisosUsuario(this.usuario.idUsuario, node.idModulo).subscribe(
            (permisos_result) => {
              permisoshijos = permisos_result;
              this.peticionesService.onCancelPendingRequests();
              if (permisoshijos.length > 0) {
                for (let index = 0; index < permisoshijos.length; index++) {
                  if (this.tree.find(permisoshijos[index].idModulo) === undefined) {
                    this.tree.insert(node.idModulo, permisoshijos[index].idModulo, permisoshijos[index]);
                    this.onExpand(permisoshijos[index]);
                  }
                }
              } else {
                this.dataSource.data = quitarPropiedades(Object.values(this.tree));
              }
            },
            (err) => {
              console.log(err);
              if (err.status != 401) {
                this.peticionesService.onCancelPendingRequests();
              }
            }
          );
        },
        () => { }
      );
    } else {
      this.route.paramMap.subscribe(
        (params) => {
          this.apinayarbotService.getAsignacionPermisosPerfil(this.perfil.idPerfil, node.idModulo).subscribe(
            (permisos_result) => {
              permisoshijos = permisos_result;
              this.peticionesService.onCancelPendingRequests();
              if (permisoshijos.length > 0) {
                for (let index = 0; index < permisoshijos.length; index++) {
                  if (this.tree.find(permisoshijos[index].idModulo) === undefined) {
                    this.tree.insert(node.idModulo, permisoshijos[index].idModulo, permisoshijos[index]);
                    this.onExpand(permisoshijos[index]);
                  }
                }
              } else {
                this.dataSource.data = quitarPropiedades(Object.values(this.tree));
              }
            },
            (err) => {
              console.log(err);
              if (err.status != 401) {
                this.peticionesService.onCancelPendingRequests();
              }
            }
          );
        },
        () => { }
      );
    }
  }

  modificarTabla() {
    Swal.fire({
      title: '¿Está seguro de modificar los permisos?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.modificar = true;
      }
    })
  }

  guardarTabla() {
    this.postpermisos = [];
    Swal.fire({
      title: '¿Guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.usuario != undefined) {
          for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
            if (this.treeControl.dataNodes[index].agregar === true) {
              var asignacionPermisosU = {
                "idUsuario": this.usuario.idUsuario,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "AG"
              }
              this.postpermisos.push(asignacionPermisosU);
            }
            if (this.treeControl.dataNodes[index].borrar === true) {
              var asignacionPermisosU = {
                "idUsuario": this.usuario.idUsuario,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "BO"
              }
              this.postpermisos.push(asignacionPermisosU);
            }
            if (this.treeControl.dataNodes[index].modificar === true) {
              var asignacionPermisosU = {
                "idUsuario": this.usuario.idUsuario,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "MO"
              }
              this.postpermisos.push(asignacionPermisosU);
            }
            if (this.treeControl.dataNodes[index].ver === true) {
              var asignacionPermisosU = {
                "idUsuario": this.usuario.idUsuario,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "VE"
              }
              this.postpermisos.push(asignacionPermisosU);
            }
          }
          this.postAsignacionPermisosUsuario();
        } else {
          for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
            if (this.treeControl.dataNodes[index].agregar === true) {
              var asignacionPermisosP = {
                "idPerfil": this.perfil.idPerfil,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "AG"
              }
              this.postpermisos.push(asignacionPermisosP);
            }
            if (this.treeControl.dataNodes[index].borrar === true) {
              var asignacionPermisosP = {
                "idPerfil": this.perfil.idPerfil,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "BO"
              }
              this.postpermisos.push(asignacionPermisosP);
            }
            if (this.treeControl.dataNodes[index].modificar === true) {
              var asignacionPermisosP = {
                "idPerfil": this.perfil.idPerfil,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "MO"
              }
              this.postpermisos.push(asignacionPermisosP);
            }
            if (this.treeControl.dataNodes[index].ver === true) {
              var asignacionPermisosP = {
                "idPerfil": this.perfil.idPerfil,
                "idModulo": this.treeControl.dataNodes[index].idModulo,
                "idTipoPermisoUsuario": "VE"
              }
              this.postpermisos.push(asignacionPermisosP);
            }
          }
          const modalRef = this.modalService.open(AsignarusuariospermisosmodalComponent, { centered: true, backdrop: 'static', size: 'xl' });
          modalRef.componentInstance.perfil = this.perfil;
          modalRef.result.then((result: any) => {
            if (result) {
              this.postAsignacionPermisosPerfil(result);
            } else {
              this.postAsignacionPermisosPerfil(null);
            }
          }).catch(error => { });
        }
      }
    })
  }

  postAsignacionPermisosUsuario() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.postAsignacionPermisosUsuario();
    });
    if (this.postpermisos.length === 0) {
      const idUsuario = this.usuario.idUsuario;
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apinayarbotService.deletePermisosUsuario(idUsuario);
        peticion.subscribe(
          (permisos_result) => {
            this.peticionesService.onCancelPendingRequests();
            Swal.fire({
              icon: 'success',
              title: 'ASIGNACIÓN DE PERMISOS USUARIO ' + this.usuario.nombres + ' ACTUALIZADO',
              text: permisos_result,
              confirmButtonColor: '#5E72E4',
            });
            this.modificar = false;
            this.permisosT();
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
              this.modificar = false;
              this.permisosT();
            } else {
              console.log(err);
              this.modificar = false;
              this.permisosT();
            }
          }
        );
      });
    } else {
      var asignacionPermisosUsuario = {
        "permisosUsuario": this.postpermisos
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apinayarbotService.postAsignacionPermisosUsuario(asignacionPermisosUsuario);
        peticion.subscribe(
          (permisos_result) => {
            this.peticionesService.onCancelPendingRequests();
            Swal.fire({
              icon: 'success',
              title: 'ASIGNACIÓN DE PERMISOS USUARIO ' + this.usuario.nombres + ' ACTUALIZADO',
              text: permisos_result,
              confirmButtonColor: '#5E72E4',
            });
            this.modificar = false;
            this.permisosT();
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
              this.modificar = false;
              this.permisosT();
            } else {
              console.log(err);
              this.modificar = false;
              this.permisosT();
            }
          }
        );
      });
    }
  }

  postAsignacionPermisosPerfil(usuariosPerfil: any) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.postAsignacionPermisosPerfil(usuariosPerfil);
    });

    if (this.postpermisos.length === 0) {
      const deletePermisosPerfilUsuarios = {
        "idPerfil": this.perfil.idPerfil,
        "usuarios": usuariosPerfil
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apinayarbotService.deletePermisosPerfil(deletePermisosPerfilUsuarios);
        peticion.subscribe(
          (permisos_result) => {
            this.peticionesService.onCancelPendingRequests();
            Swal.fire({
              icon: 'success',
              title: 'ASIGNACIÓN DE PERMISOS PERFIL ' + this.perfil.nombre + ' ACTUALIZADO',
              text: permisos_result,
              confirmButtonColor: '#5E72E4',
            });
            this.modificar = false;
            this.permisosT();
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
              this.modificar = false;
              this.permisosT();
            } else {
              console.log(err);
              this.modificar = false;
              this.permisosT();
            }
          }
        );
      });
    } else {
      const asignacionPermisosPerfilUsuarios = {
        "permisosPerfil": this.postpermisos,
        "usuarios": usuariosPerfil
      }
      this.route.paramMap.subscribe((params) => {
        let peticion: Observable<any>;
        peticion = this.apinayarbotService.postAsignacionPermisosPerfil(asignacionPermisosPerfilUsuarios);
        peticion.subscribe(
          (permisos_result) => {
            this.peticionesService.onCancelPendingRequests();
            Swal.fire({
              icon: 'success',
              title: 'ASIGNACIÓN DE PERMISOS PERFIL ' + this.perfil.nombre + ' ACTUALIZADO',
              text: permisos_result,
              confirmButtonColor: '#5E72E4',
            });
            this.modificar = false;
            this.permisosT();
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
              this.modificar = false;
              this.permisosT();
            } else {
              console.log(err);
              this.modificar = false;
              this.permisosT();
            }
          }
        );
      });
    }
  }

  verC(idModulo: any, ver: any = 0) {
    var i = 0;
    if (ver === 1) {
      this.treeControl.dataNodes.forEach(x => {
        if (x.idModulo === idModulo) {
          if (x.ver === true) {
            if (x.agregar === true || x.borrar === true || x.modificar === true) {
              x.agregar = false;
              x.borrar = false;
              x.modificar = false;
              return;
            }
          }
        }
        i++;
      });
    } else {
      this.treeControl.dataNodes.forEach(x => {
        if (x.idModulo === idModulo) {
          if (x.agregar != true || x.borrar != true || x.modificar != true) {
            x.ver = true;
            return;
          } else if (x.agregar === true || x.borrar === true || x.modificar === true) {
            x.ver = true;
            return;
          }
        }
        i++;
      });
    }
  }
}

function quitarPropiedades(tree) {
  var arr: any[] = [];
  const padre: modulo = {
    "idModulo": tree[0].value.idModulo,
    "nombre": tree[0].value.nombre,
    "descripcion": tree[0].value.descripcion,
    "moduloPadre": tree[0].value.moduloPadre,
    "children": tree[0].children,
    "agregar": tree[0].value.agregar,
    "borrar": tree[0].value.borrar,
    "modificar": tree[0].value.modificar,
    "ver": tree[0].value.ver
  }
  arr.push(padre);
  if (arr[0].children.length != 0) {
    arr[0].children = recursiva(arr[0].children);
  }
  return arr;
}

function recursiva(treef) {
  var arr: any[] = [];
  for (let index = 0; index < treef.length; index++) {
    const hijo: modulo = {
      "idModulo": treef[index].value.idModulo,
      "nombre": treef[index].value.nombre,
      "descripcion": treef[index].value.descripcion,
      "moduloPadre": treef[index].value.moduloPadre,
      "agregar": treef[index].value.agregar,
      "borrar": treef[index].value.borrar,
      "modificar": treef[index].value.modificar,
      "ver": treef[index].value.ver
    }
    if (treef[index].children.length != 0) {
      hijo.children = treef[index].children;
    }
    arr.push(hijo);
    if (treef[index].children.length != 0) {
      arr[index].children = recursiva(arr[index].children);
    }
  }
  return arr;
}