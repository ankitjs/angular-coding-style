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
import { UserInfoService } from "../../../../shared/services/security.service";
@Component({
  selector: "app-doughnut-chart`",
  templateUrl: "doughnut.component.html",
  styleUrls: ["doughnut.component.scss"],
})
export class DoughnutComponent implements OnInit, OnDestroy {
  @ViewChild("chart", { static: true }) chartElement: ElementRef<
    HTMLCanvasElement
  >;
  @ViewChild("tooltip", { static: false }) tooltip: ElementRef<HTMLElement>;
  subscription: Subscription = new Subscription();
  loading: boolean = true;
  noData: boolean = false;
  chartRef: any;
  fetching: boolean = false;
  customTooltips: (tooltip: any) => void;
  currencySymbol: any;
  showCurrencySymbol: boolean = false;
  constructor(
    private chartContainerService: ChartContainerService,
    private cdf: ChangeDetectorRef,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit() {
    this.getCurrencySymbol();
    this.setCustomTooltip();
    this.chartDataListner();
    this.chartLoaderListner();
  }

  getCurrencySymbol() {
    const userInfo = this.userInfoService.get();
    try {
      this.currencySymbol = userInfo.currency.symbol;
    } catch (error) {}
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

  /**
   *
   *custom legends variables
   *
   */
  labelRef: string[];
  backgroundColorRef: string[];
  dataRef: number[];

  /**
   * it will set custom legends right to the doughnut chart
   * @param data labels array and datassets array
   */

  setCusLegends(data: { labels: string[]; datasets: any[] }, option: any) {
    if (data.datasets && data.datasets.length) {
      this.labelRef = data.labels;

      const dataSets = data.datasets[0];
      this.backgroundColorRef = dataSets.backgroundColor;
      this.dataRef = dataSets.data;
      this.showCurrencySymbol = option.currencySymbol;
    } else {
      this.labelRef = [];
    }
  }

  chartDataListner() {
    this.subscription.add(
      this.chartContainerService.chartDataEmitter.subscribe(
        (data: { data: any; options: any }) => {
          if (data) {
            this.setCusLegends(data.data, data.options);
            this.loading = false;
            let chartProp = Object.assign(
              { data: data.data },
              this.chartInitConfig()
            );
            this.setNoDataOverlay(chartProp);
            if (this.chartRef) {
              this.chartRef.clear();
              this.chartRef.destroy();
            }
            this.chartRef = new Chart(
              this.chartElement.nativeElement,
              chartProp
            );
            // document.getElementById(
            //   "chartjs-legend"
            // ).innerHTML = this.chartRef.generateLegend();
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
      this.noData = false;
      this.cdf.markForCheck();
    }
  }

  chartInitConfig() {
    return {
      type: "doughnut",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let sumOfDataSets = 0;
              for (let i = 0; i < data.datasets[0].data.length; i++) {
                sumOfDataSets += data.datasets[0].data[i];
              }

              var label =
                data.labels[tooltipItem.index] +
                  ":" +
                  (
                    (data.datasets[0].data[tooltipItem.index] / sumOfDataSets) *
                    100
                  ).toFixed(2) +
                  "%" || "";
              return label;
            },
          },
          enabled: false,
          custom: this.customTooltips,
        },
      },
    };
  }

  setCustomTooltip() {
    var that = this;
    Chart.defaults.global.pointHitDetectionRadius = 1;
    this.customTooltips = function (tooltip) {
      // Tooltip Element
      var tooltipEl = that.tooltip.nativeElement;

      // Hide if no tooltip
      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = "0";
        return;
      }

      // Set caret Position
      tooltipEl.classList.remove("above", "below", "no-transform");
      if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
      } else {
        tooltipEl.classList.add("no-transform");
      }

      function getBody(bodyItem) {
        return bodyItem.lines;
      }

      // Set Text
      if (tooltip.body) {
        var titleLines = tooltip.title || [];
        var bodyLines = tooltip.body.map(getBody);
        var innerHtml = "<thead>";
        titleLines.forEach(function (title) {
          innerHtml += "<tr><th>" + title + "</th></tr>";
        });
        innerHtml += "</thead><tbody>";

        bodyLines.forEach(function (body, i) {
          //get label name by removing number after :
          let labelbody = body[0];
          const lastColonIndex = body[0].lastIndexOf(":");
          const label = labelbody.substr(0, labelbody.lastIndexOf(":"));
          const value = labelbody.substr(lastColonIndex + 1, labelbody.length);
          innerHtml += `<tr><td>${label}</td><td> : </td><td>${value}</td></tr>`;
        });
        innerHtml += "</tbody>";

        var tableRoot = tooltipEl.querySelector("table");
        tableRoot.innerHTML = innerHtml;
      }

      var positionY = this._chart.canvas.offsetTop;
      var positionX = this._chart.canvas.offsetLeft;

      // Display, position, and set styles for font
      tooltipEl.style.opacity = "1";
      tooltipEl.style.left = positionX + tooltip.caretX + "px";
      tooltipEl.style.top = positionY + tooltip.caretY + "px";
      tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
      tooltipEl.style.fontSize = tooltip.bodyFontSize;
      tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
      tooltipEl.style.padding =
        tooltip.yPadding + "px " + tooltip.xPadding + "px";
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
