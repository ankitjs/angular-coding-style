import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from "../../entity-dashboards/employee/node_modules/@angular/core";
import * as Chart from "chart.js";
import { ChartContainerService } from "../../dashboard-cards/chart-container/chart-container.service";
import { Subscription } from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs";

@Component({
  selector: "app-line-bar-chart",
  templateUrl: "line-bar.component.html",
})
export class LineBarComponent implements OnInit, OnDestroy {
  @ViewChild("chart", { static: true }) chartElement: ElementRef<
    HTMLCanvasElement
  >;
  subscription: Subscription = new Subscription();
  loading: boolean = true;
  noData: boolean = false;
  chartRef: any;
  fetching: boolean = false;
  constructor(
    private chartContainerService: ChartContainerService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chartDataListner();
    this.chartLoaderListner();
  }

  chartLoaderListner() {
    this.subscription.add(
      this.chartContainerService.chartLoader.subscribe((data: boolean) => {
        this.fetching = data;
        this.loading = data;
        this.cdf.detectChanges();
      })
    );
  }

  chartDataListner() {
    this.subscription.add(
      this.chartContainerService.chartDataEmitter.subscribe(
        (data: { data: any; options: any }) => {
          if (data) {
            this.loading = false;

            let chartProp = Object.assign(
              { data: data.data },
              this.chartInitConfig(data.options)
            );
            this.checkIfOnlyBar(chartProp);
            this.setChartLegends(chartProp, data.options);
            this.setNoDataOverlay(chartProp);
            if (this.chartRef) {
              this.chartRef.clear();
              this.chartRef.destroy();
            }
            this.chartRef = new Chart(
              this.chartElement.nativeElement,
              chartProp
            );
            this.cdf.markForCheck();
          }
        }
      )
    );
  }

  checkIfOnlyBar(chartProp: any) {
    if (chartProp.data) {
      if (chartProp.data.datasets && chartProp.data.datasets.length) {
        if (chartProp.data.datasets.length === 1) {
          chartProp.options.scales.yAxes.length = 1;
        }
      }
    }
  }

  setChartLegends(chartProp: any, options: any) {
    if (chartProp.options.scales.yAxes[0] && options.yAxis)
      chartProp.options.scales.yAxes[0].scaleLabel.labelString = options.yAxis;
    if (chartProp.options.scales.yAxes[1] && options.y2Axis)
      chartProp.options.scales.yAxes[1].scaleLabel.labelString = options.y2Axis;
  }

  setNoDataOverlay(chartProp) {
    if (!chartProp.data || !Object.keys(chartProp.data).length) {
      this.noData = true;
      this.cdf.markForCheck();
    } else {
      if (
        (chartProp.data.datasets[0] &&
          chartProp.data.datasets[0].data.length) ||
        (chartProp.data.datasets[1] && chartProp.data.datasets[1].data.length)
      ) {
        this.noData = false;
        this.cdf.markForCheck();
      } else {
        this.noData = true;
        this.cdf.markForCheck();
      }
    }
  }

  chartInitConfig(options) {
    return {
      type: "bar",
      options: {
        tooltips: {
          mode: "point",
          intersect: false,
          callbacks: {
            label: function (tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || "";
              if (label) {
                label += ": ";
              }
              if (
                options.y2Axis.indexOf(" ") >= 0 &&
                tooltipItem.datasetIndex == 0
              ) {
                label += options.y2Axis.charAt(0);
              }

              if (tooltipItem.yLabel % 1 === 0) {
                label += tooltipItem.yLabel;
              } else {
                label += tooltipItem.yLabel.toFixed(2);
              }

              return label;
            },
          },
        },
        elements: {
          line: {
            tension: 0,
            fill: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        barValueSpacing: 20,
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 9,
            fontStyle: "bold",
            padding: 15,
          },
        },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                fontStyle: "bold",
              },
              ticks: {
                padding: 7,
                beginAtZero: true,
                userCallback: function (label) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
              },
              type: "linear",
              display: true,
              position: "left",
              id: "y-axis-1",
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
              labels: {
                show: true,
              },
            },
            {
              scaleLabel: {
                display: true,
                fontStyle: "bold",
              },
              ticks: {
                beginAtZero: true,
                padding: 7,
              },
              type: "linear",
              display: true,
              position: "right",
              id: "y-axis-2",
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
              labels: {
                show: true,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
              // barPercentage: 0.5,
              scaleLabel: {
                display: false,
                fontStyle: "bold",
                labelString: "Months",
              },
              ticks: {
                padding: 7,
              },
            },
          ],
        },
      },
    };
  }

  // initChart() {
  //   new Chart(this.chartElement.nativeElement, {
  //     type: "bar",
  //     data: {
  //       datasets: [
  //        {
  //   label: "Line Dataset",
  //   backgroundColor: "rgb(51, 225, 164)",
  //   borderColor: "rgb(51, 225, 164)",
  //   pointBorderColor: "rgb(51, 225, 164)",
  //   pointBackgroundColor: "white",
  //   pointHoverBackgroundColor: "#EC932F",
  //   pointHoverBorderColor: "#EC932F",
  //   data: [25, 40, 30, 45],
  //   yAxisID: "y-axis-2",
  //   type: "line"
  // },
  // {
  //   label: "Bar Dataset",
  //   backgroundColor: "rgb(74, 166, 252)",
  //   yAxisID: "y-axis-1",
  //   data: [39, 34, 35, 30]
  // }
  //       ],
  //       labels: ["January", "February", "March", "April"]
  //     },
  //     options: {
  //       elements: {
  //         line: {
  //           tension: 0,
  //           fill: false
  //         }
  //       },
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       legend: {
  //         display: false,
  //         position: "bottom"
  //       },
  //       scales: {
  //         yAxes: [
  //           {
  //             scaleLabel: {
  //               display: true,
  //               labelString: "Requests"
  //             },
  //             ticks: {
  //               beginAtZero: true
  //             },
  //             type: "linear",
  //             display: true,
  //             position: "left",
  //             id: "y-axis-1",
  //             gridLines: {
  //               display: true
  //             },
  //             labels: {
  //               show: true
  //             }
  //           },
  //           {
  //             scaleLabel: {
  //               display: true,
  //               labelString: "Hours"
  //             },
  //             ticks: {
  //               beginAtZero: true
  //             },
  //             type: "linear",
  //             display: true,
  //             position: "right",
  //             id: "y-axis-2",
  //             gridLines: {
  //               display: false
  //             },
  //             labels: {
  //               show: true
  //             }
  //           }
  //         ],
  //         xAxes: [
  //           {
  //             gridLines: {
  //               display: false
  //             },
  //             barPercentage: 0.5,
  //             scaleLabel: {
  //               display: true,
  //               labelString: "Months"
  //             }
  //           }
  //         ]
  //       }
  //     }
  //   });
  // }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chartRef) {
      this.chartRef.clear();
      this.chartRef.destroy();
    }
  }
}
