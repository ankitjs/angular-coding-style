import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
} from "../../entity-dashboards/employee/node_modules/@angular/core";
import * as Chart from "chart.js";
import { ChartContainerService } from "../../dashboard-cards/chart-container/chart-container.service";
import { Subscription } from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs";
@Component({
  selector: "app-multi-bar-chart",
  templateUrl: "multi-bar.component.html",
})
export class MultiBarComponent implements OnInit, OnDestroy {
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
            this.setChartLegends(chartProp, data.options);
            this.setIfStackChart(chartProp, data.options);
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

  setChartLegends(chartProp: any, options: any) {
    chartProp.options.scales.yAxes[0].scaleLabel.labelString = options.yAxis;
    chartProp.options.scales.xAxes[0].scaleLabel.labelString = options.xAxis;
  }

  setIfStackChart(chartProp: any, options: any) {
    chartProp.options.scales.yAxes[0].stacked = options.stacked || false;
    chartProp.options.scales.xAxes[0].stacked = options.stacked || false;
  }

  setNoDataOverlay(chartProp) {
    if (!chartProp.data || !Object.keys(chartProp.data).length) {
      this.noData = true;
      this.cdf.markForCheck();
    } else {
      if (
        (chartProp.data.datasets[0].data &&
          chartProp.data.datasets[0].data.length) ||
        (chartProp.data.datasets[1] &&
          chartProp.data.datasets[1].data &&
          chartProp.data.datasets[1].data.length)
      ) {
        this.noData = false;
        this.cdf.markForCheck();
      } else {
        this.noData = true;
        this.cdf.markForCheck();
      }
    }
  }

  chartInitConfig(options: any) {
    return {
      type: "bar",
      options: {
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

        tooltips: {
          mode: "point",
          intersect: false,
          callbacks: {
            label: function (tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || "";
              if (label) {
                label += ": ";
              }
              if (options.yAxis.indexOf(" ") >= 0) {
                label += options.yAxis.charAt(0);
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
        scales: {
          yAxes: [
            {
              stacked: false,
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
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
            },
          ],
          xAxes: [
            {
              stacked: false,
              ticks: {
                padding: 5,
                callback: function (value: string) {
                  if (value.length > 20) {
                    return `${value.substr(0, 19)}...`;
                  } else {
                    return value;
                  }
                },
              },
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
              //barPercentage: 0.9,
              scaleLabel: {
                display: false,
                fontStyle: "bold",
              },
            },
          ],
        },
      },
    };
  }

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
