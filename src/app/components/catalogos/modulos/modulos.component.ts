import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApinayarbotService } from "../../../services/northwareUtils.service";
import { ActivatedRoute } from "@angular/router";
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
import { TreeService } from 'src/app/services/tree.service';

export class moduloNode {
  constructor(
    public expandable: boolean,
    public nombre: string,
    public idModulo: string,
    public descripcion: string,
    public moduloPadre: string,
    public level: number) { }
}

export class modulo {
  idModulo: string;
  nombre: string;
  descripcion: string;
  moduloPadre: string;
  children?: modulo[] | any[];
}

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.scss']
})
export class ModulosComponent implements OnInit, OnDestroy {

  tree: any;

  displayedColumns: string[] = ['name', 'table-actions'];

  treeControl: FlatTreeControl<moduloNode>;
  treeFlattener: MatTreeFlattener<modulo, moduloNode>;
  dataSource: MatTreeFlatDataSource<modulo, moduloNode> | any;

  form = false; 
  newM = false;
  showM = false;
  editM = false;

  nombre = null;
  moduloPadre = null;
  descripcion = null;
  idModuloPadre = null;
  idModulo = null;

  btnRaiz = false;

  private _subscriptionPeticion: Subscription = new Subscription();

  constructor(private apinayarbotService: ApinayarbotService, private route: ActivatedRoute, private spinner: NgxSpinnerService, public peticionesService: PeticionesService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel, this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<moduloNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnDestroy(): void {
    this.peticionesService.onCancelPendingRequests();
  }

  hasChild = (_: number, _nodeData: moduloNode) => _nodeData.expandable;

  transformer = (node: modulo, level: number) => {
    return new moduloNode(!!node.children, node.nombre, node.idModulo, node.descripcion, node.moduloPadre, level);
  }

  private _getLevel = (node: moduloNode) => node.level;

  private _isExpandable = (node: moduloNode) => node.expandable;

  private _getChildren = (node: modulo) => node.children;

  ngOnInit(): void {
    this.modulosT();
  }

  modulosT() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.modulosT();
    })
    this.close();
    this.spinner.show();
    var modulos: any;
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getModulosByModuloPadre("").subscribe(
          (modulos_result) => {
            modulos = modulos_result;
            this.peticionesService.onCancelPendingRequests();
            if (modulos.length > 0) {
              this.tree = new TreeService(modulos[0].idModulo, modulos[0]);
              this.onExpand(modulos[0]);
            } else {
              this.btnRaiz = true;
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
            } else if (err.status === 403) {
              Swal.fire({
                icon: 'info',
                title: 'Modulos',
                text: err.error.errorMessages,
                confirmButtonColor: '#5E72E4',
                iconColor: '#5E72E4',
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

  onExpand(node: any) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.onExpand(node);
    });
    var moduloshijos: any;
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getModulosByModuloPadre(node.idModulo).subscribe(
          (modulos_result) => {
            moduloshijos = modulos_result;
            this.peticionesService.onCancelPendingRequests();
            if (moduloshijos.length > 0) {
              for (let index = 0; index < moduloshijos.length; index++) {
                if (this.tree.find(moduloshijos[index].idModulo) === undefined) {
                  this.tree.insert(node.idModulo, moduloshijos[index].idModulo, moduloshijos[index]);
                  this.onExpand(moduloshijos[index]);
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

  expandNode(moduloPadre) {
    var i = 0;
    this.treeControl.dataNodes.forEach(x => {
      if (x.idModulo === moduloPadre) {
        this.treeControl.expand(this.treeControl.dataNodes[i]);
        if (x.moduloPadre != null) {
          this.expandNode(x.moduloPadre);
        }
      }
      i++;
    });
  }

  nuevoModulo(data: any = null) {
    this.close();
    this.newM = true;
    this.form = true;
    if (data != null) {
      if (data.idModulo != null) {
        this.moduloPadre = data.nombre.toUpperCase();
      } else {
        this.moduloPadre = data.nombre;
      }
      this.idModuloPadre = data.idModulo;
    } else {
      this.moduloPadre = data;
      this.idModuloPadre = data;
    }
  }

  editarModulo(data: any) {
    this.verModulo(data);
    this.editM = true;
    this.form = true;
  }

  borrarModulo(data: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'ELIMINAR MODULO: '+data.nombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5E72E4',
      cancelButtonColor: '#5E585C',
      confirmButtonText: 'ELIMINAR MODULO',
      cancelButtonText: 'CANCELAR',
      iconColor: '#510A00',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteModulos(data);
      }
    });
  }

  deleteModulos(data: any) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.deleteModulos(data);
    });
    const idModulo = data.idModulo;
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.deleteModulos(idModulo);
      peticion.subscribe(
        (modulo_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire(
            'MODULO ELIMINADO!',
            idModulo,
            'success'
          )
          if(!this.tree.remove(idModulo)) {
            this.dataSource = null;
            this.modulosT();
            return;
          }
          this.dataSource.data = quitarPropiedades(Object.values(this.tree));
          this.treeControl.collapseAll();
          var i = 0;
          this.treeControl.dataNodes.forEach(x => {
            if (data.moduloPadre != null) {
              this.expandNode(data.moduloPadre);
            }
            i++;
          });
          this.close();
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
              title: 'Borrar modulo',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  verModulo(data: any) {
    this.close();
    this.idModulo = data.idModulo;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.idModuloPadre = data.moduloPadre;
    if (data.moduloPadre != null) {
      this.moduloPadre = this.tree.find(data.moduloPadre).value.nombre.toUpperCase();
    } else {
      this.moduloPadre = data.moduloPadre;
    }
  }

  detallesModulo(data: any) {
    this.verModulo(data);
    this.showM = true;
    this.form = true;
  }

  close() {
    this.form = false;
    this.newM = false;
    this.showM = false;
    this.editM = false;

    this.nombre = null;
    this.moduloPadre = null;
    this.descripcion = null;
    this.idModuloPadre = null;
    this.idModulo = null;
  }

  guardarModulo(func: string) {
    (function () {
      'use strict'

      var forms = document.querySelectorAll('.validation')

      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.addEventListener('submit', function (event: any) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }
            form.classList.add('was-validated')
          }, false)
        })
    })()
    if (this.nombre === null || this.nombre === "") {
      return;
    } else {
      if (this.descripcion === "") {
        this.descripcion = null;
      }
      if (func === 'edit') {
        this.updateModulo();
      } else if (func === 'new') {
        this.createModulo();
      }
    }
  }

  createModulo() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.createModulo();
    });
    const modulo = {
      "nombre": this.nombre,
      "descripcion": this.descripcion,
      "moduloPadre": this.idModuloPadre
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.postModulos(modulo);
      peticion.subscribe(
        (modulo_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'MODULO REGISTRADO',
            text: modulo_result,
            confirmButtonColor: '#5E72E4',
          });
          this.cuOnExpant(modulo);
          this.btnRaiz = false;
          this.close();
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
              title: 'Agregar modulo',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  updateModulo() {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.updateModulo();
    });
    const modulo = {
      "idModulo": this.idModulo,
      "nombre": this.nombre,
      "descripcion": this.descripcion,
      "moduloPadre": this.idModuloPadre
    }
    this.route.paramMap.subscribe((params) => {
      let peticion: Observable<any>;
      peticion = this.apinayarbotService.putModulos(modulo);
      peticion.subscribe(
        (modulo_result) => {
          this.peticionesService.onCancelPendingRequests();
          Swal.fire({
            icon: 'success',
            title: 'MODULO ACTUALIZADO',
            text: modulo_result,
            confirmButtonColor: '#5E72E4',
          });
          this.tree.update(this.idModulo, modulo);
          this.dataSource.data = quitarPropiedades(Object.values(this.tree));
          this.treeControl.collapseAll();
          var i = 0;
          this.treeControl.dataNodes.forEach(x => {
            if (modulo.moduloPadre != null) {
              this.expandNode(modulo.moduloPadre);
            }
            i++;
          });
          this.close();
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
              title: 'Editar modulo',
              text: err.error.errorMessages,
              confirmButtonColor: '#5E72E4',
              iconColor: '#5E72E4',
            });
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  cuOnExpant(modulo: any) {
    this._subscriptionPeticion = this.peticionesService.peticion$.subscribe((data) => {
      this.cuOnExpant(modulo);
    });
    var moduloshijos: any;
    var insert = false;
    this.route.paramMap.subscribe(
      (params) => {
        this.apinayarbotService.getModulosByModuloPadre(modulo.moduloPadre).subscribe(
          (modulos_result) => {
            moduloshijos = modulos_result;
            this.peticionesService.onCancelPendingRequests();
            if (moduloshijos.length > 0) {
              for (let index = 0; index < moduloshijos.length; index++) {
                if (this.tree.find(moduloshijos[index].idModulo) === undefined) {
                  this.tree.insert(modulo.moduloPadre, moduloshijos[index].idModulo, moduloshijos[index]);
                  insert = true;
                }
              }
              if (insert === true) {
                this.dataSource.data = quitarPropiedades(Object.values(this.tree));
                this.treeControl.collapseAll();
                var i = 0;
                this.treeControl.dataNodes.forEach(x => {
                  if (modulo.moduloPadre != null) {
                    this.expandNode(modulo.moduloPadre);
                  }
                  i++;
                });
              }
            } else {
              this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
              this.modulosT();
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

function quitarPropiedades(tree) {
  var arr: any[] = [];
  const padre = {
    "idModulo": tree[0].value.idModulo,
    "nombre": tree[0].value.nombre,
    "descripcion": tree[0].value.descripcion,
    "moduloPadre": tree[0].value.moduloPadre,
    "children": tree[0].children
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
    const hijo : modulo = {
      "idModulo": treef[index].value.idModulo,
      "nombre": treef[index].value.nombre,
      "descripcion": treef[index].value.descripcion,
      "moduloPadre": treef[index].value.moduloPadre,
    }
    if ( treef[index].children.length != 0 ) {
      hijo.children = treef[index].children;
    }
    arr.push(hijo);
    if (treef[index].children.length != 0) {
      arr[index].children = recursiva(arr[index].children);
    }
  }
  return arr;
}