import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

export interface ChartModel {
  data: [],
  label: string
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  public data: ChartModel[] = [];
  public broadcastedData: ChartModel[] = [];

  public datos = [];
  public labels: string[] = [];

  constructor(
    public toastr: ToastrService
  ) { }

  hubConnection: signalR.HubConnection | undefined;

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      //.withUrl('https://localhost:7207/toastr', {
      .withUrl('https://localhost:7207/chart', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log("hubConnectionStart")
        //this.askServerListener();
        //this.askServer();
      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  async askServer() {
    console.log("askServerStart")

    await this.hubConnection?.invoke("askServer", "hi")
      .then(() => {
        console.log("askServer.then")
      })
      .catch(err => console.error(err));

    console.log("This is the final prompt");
  }

  askServerListener() {
    console.log("askServerListenerStart")

    this.hubConnection?.on("askServerResponse", (someText) => {
      console.log("askServerListener.then")
      this.toastr.show(
        '<span class="alert-icon ni ni-bell-55" data-notify="icon"></span> <div class="alert-text"</div> <span class="alert-title" data-notify="title">Ngx Toastr</span> <span data-notify="message">' + someText + '</span></div>',
        "",
        {
          timeOut: 8000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-success alert-notify"
        }
      );
    })
  }

  addTransferChartDataListener = (chart: any) => {
    this.hubConnection?.on('transferchartdata', (data) => {
      // Inicializar variables
      this.datos = [];
      this.labels = [];
      this.data = data;
      // Eliminar datos Chart
      this.removeData(chart);

      // Asignar datos Chart
      this.data.forEach(elemt => {
        this.labels.push(elemt.label);
        elemt.data.forEach(elemntv => {
          this.datos.push(elemntv);
          this.addData(chart, elemt.label, elemntv);
        })
      })

    })
  }

  addData(chart: any, label: any, data: any) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset: any) => {
      dataset.data.push(data);
    });
    chart.update('none');
  }

  removeData(chart: any) {
    chart.data.labels = [];
    chart.data.datasets.forEach((dataset: any) => {
      dataset.data = [];
    });
    chart.update('none');
  }

  public broadcastChartData = () => {
    const data = this.data.map(m => {
      const temp = {
        data: m.data,
        label: m.label
      }
      return temp;
    });

    this.hubConnection?.invoke('broadcastchartdata', data)
    .catch(err => console.log(err));
  }

  public addBroadcastChartDataListener = () => {
    this.hubConnection?.on('broadcastchartdata', (data) => {
      this.broadcastedData = data;
    })
  }

}
