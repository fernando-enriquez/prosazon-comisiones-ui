import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from 'src/app/services/signalr.service';
import { chartOptions } from "../../variables/charts";

@Component({
  selector: 'app-signalr',
  templateUrl: './signalr.component.html',
  styleUrls: ['./signalr.component.scss']
})
export class SignalrComponent implements OnInit, OnDestroy {
  ordersChart: any;

  constructor(
    public signalrService: SignalrService,
    private http: HttpClient
  ) { }

  ngOnDestroy(): void {
    // Desconectar servicios signalR
    //this.signalrService.hubConnection?.off("askServerResponse");
    this.signalrService.hubConnection?.off("transferchartdata");
    this.signalrService.hubConnection?.off("broadcastchartdata");
  }

  ngOnInit(): void {
    // Creación Chart
    let Chart = chartOptions();
    
    var chartOrders = <HTMLCanvasElement>document.getElementById("chart-bars2");

    this.ordersChart = new Chart(chartOrders, {
      type: "bar",
      data: {
        labels: this.signalrService.labels,
        datasets: [
          {
            label: "Sales",
            data: this.signalrService.datos,
            barThickness: 9
          }
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value: any) {
                if (!(value % 10)) {
                  return value;
                }
                return;
              }
            },
            grid: {
              borderWidth: 0,
              borderDash: [1, 1]
            }
          },
          x: {
            grid: {
              display: false,
              borderWidth: 0,
            },
          }
        },
        plugins: {
          legend: {
            display: false,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 16
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          },
        },
      }
    });

    // Conexión al servicio signalR
    this.signalrService.startConnection();
    // Handlers del servidor
    this.signalrService.addTransferChartDataListener(this.ordersChart);
    this.signalrService.addBroadcastChartDataListener();
    // Petición api chart
    this.startHttpRequest();
  }

  private startHttpRequest = () => {
    this.http.get('https://localhost:7207/api/chart')
      .subscribe(res => {
        console.log(res);
      });
  }

  chartClicked(event: any) {
    this.signalrService.broadcastChartData();
  }

}
