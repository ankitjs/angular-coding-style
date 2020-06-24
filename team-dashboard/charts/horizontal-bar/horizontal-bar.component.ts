import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
} from "../../entity-dashboards/employee/node_modules/@angular/core";
import * as Chart from "chart.js";
import { ChartContainerService } from "../../dashboard-cards/chart-container/chart-container.service";
import { Subscription } from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs";
@Component({
  selector: "app-horizontal-bar-chart",
  templateUrl: "horizontal-bar.component.html",
})
export class HorizontalBarComponent implements OnInit, OnDestroy {
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
              this.chartInitConfig()
            );
            this.setChartLegends(chartProp, data.options);
            this.setDataSetLabel(chartProp, data.options);
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

  setNoDataOverlay(chartProp) {
    if (!chartProp.data || !Object.keys(chartProp.data).length) {
      this.noData = true;
      this.cdf.markForCheck();
    } else {
      if (chartProp.data.datasets.length) {
        let isData: boolean = false;
        const data = chartProp.data.datasets[0].data;
        if (data.length) {
          isData = this.isNoDataArray(data);

          if (isData) {
            this.noData = false;
            this.cdf.markForCheck();
          } else {
            this.noData = true;
            this.cdf.markForCheck();
          }
        }
      }

      // this.noData = false;
      // this.cdf.markForCheck();
    }
  }

  isNoDataArray(data: any) {
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        //isData = true;
        return true;
      }
    }
  }

  setDataSetLabel(chartProp: any, options: any) {
    if (chartProp.data && chartProp.data.datasets)
      chartProp.data.datasets[0].label = options.label;
  }

  setChartLegends(chartProp: any, options: any) {
    chartProp.options.scales.yAxes[0].scaleLabel.labelString = options.yAxis;
    chartProp.options.scales.xAxes[0].scaleLabel.labelString = options.xAxis;
  }

  chartInitConfig() {
    return {
      type: "horizontalBar",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
          position: "bottom",
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
              },
              // barPercentage: 0.9,
              scaleLabel: {
                display: true,
                fontStyle: "bold",
              },
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
            },
          ],
          xAxes: [
            {
              gridLines: {
                drawOnChartArea: false,
                drawTicks: false,
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
              scaleLabel: {
                display: true,
                fontStyle: "bold",
                padding: 15,
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
