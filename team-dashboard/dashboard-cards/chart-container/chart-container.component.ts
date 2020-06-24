/**
 *
 * Created by Ankit Sharma
 *
 */
import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { ChartContainerService } from "./chart-container.service";
import { HorizontalBarChartService } from "./chart-data-utils/horizontal-bar";
import { DoughnutChartService } from "./chart-data-utils/doughnut";
import { DateRangeComponent } from "../../../../shared/components/date-range/date-range.component";
import { DashboardService } from "../../../dashboard.service";
import { Subscription } from "../../entity-dashboards/contact/summary-card/node_modules/rxjs/Subscription";
import { MultiBarService } from "./chart-data-utils/multibar";
import { LineBarChartService } from "./chart-data-utils/linebar";
import {
  debounceTime,
  distinctUntilChanged,
} from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs/operators";

@Component({
  selector: "app-chart-container",
  templateUrl: "chart-container.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChartContainerService,
    HorizontalBarChartService,
    DoughnutChartService,
    MultiBarService,
    LineBarChartService,
  ],
})
export class ChartContainerComponent implements OnInit, OnDestroy {
  /**
   * Input heading to show on card header.
   */
  @Input() heading: string;
  /**
   * Input chartType like "multiBar, bar, pie"
   */
  @Input() chartType: string;
  /**
   * Api url to fetch data of chart.
   */
  @Input() api_url: string;
  /**
   * Component id of dashboard card.
   */
  @Input() id: number;
  /**
   * Input Required configuration of charts like xaxis, yaxis, filters
   */
  @Input() config: Config;
  /**
   * Local api url with current dashboard fitlers queryparms setted.
   */
  lc_api_url: string;
  /**
   * Ref to DateRangePicker to perfrom some function from that class.
   */
  @ViewChild("range", { static: true }) rangeComponent: DateRangeComponent;
  /**
   * Contains start date and end date select by user by daterangepicker.
   * Used to set queryparams in api url.
   */
  rangeParms: any[];
  /**
   * Subscribe for the changes of dashboard fitlers.
   */
  headerFilterParams: any;
  /**
   * Subscription object to unsubscribe all subscription of class.
   */
  subscription: Subscription = new Subscription();
  /**
   * Ref to save current chart Total count and other symbols like currency.
   */
  chartSum: { count: any; value: any; symbol?: any };
  /**
   *
   */
  constructor(
    private dashboardService: DashboardService,
    private chartContainerService: ChartContainerService,
    private horizontalBarChartService: HorizontalBarChartService,
    private doughnutChartService: DoughnutChartService,
    private multiBarService: MultiBarService,
    private lineBarChartService: LineBarChartService
  ) {}

  ngOnInit() {
    this.setRangeParams();
    this.setHeaderFilterParams();
  }

  /**
   * Create api with queryparms according to current set filters by dashboard filters.
   */
  createApiUrl() {
    this.lc_api_url = this.api_url;
    if (this.rangeParms && this.rangeParms.length) {
      if (this.lc_api_url.indexOf("?") !== -1) {
        this.lc_api_url = `${this.lc_api_url}&startDate=${this.rangeParms[0]}&endDate=${this.rangeParms[1]}`;
      } else {
        this.lc_api_url = `${this.lc_api_url}?startDate=${this.rangeParms[0]}&endDate=${this.rangeParms[1]}`;
      }
    }
    if (
      this.headerFilterParams &&
      Object.keys(this.headerFilterParams).length
    ) {
      const filter = this.headerFilterParams;
      if (this.lc_api_url.indexOf("?") !== -1) {
        this.lc_api_url = `${this.lc_api_url}&territoryIds=${filter.territory}&siteIds=${filter.site}&teamIds=${filter.team}&employeeIds=${filter.employee}`;
      } else {
        this.lc_api_url = `${this.lc_api_url}?territoryIds=${
          filter.territory || ""
        }&siteIds=${filter.site}&teamIds=${filter.team}&employeeIds=${
          filter.employee
        }`;
      }
    }
  }

  /**
   * Check if daterangepicker component available then push range in rangeParms
   */
  setRangeParams() {
    if (this.rangeComponent) {
      let range = this.rangeComponent.getDefaultSelection(this.config.filter);
      const rangeArr = [];
      if (range && range.start && range.end) {
        rangeArr.push(range.start.valueOf());
        rangeArr.push(range.end.valueOf());
      }
      this.rangeParms = rangeArr;
    }
  }

  /**
   * Subscribe for the changes in dashboard filters.
   */
  setHeaderFilterParams() {
    this.subscription.add(
      this.dashboardService.headerFilterSubject
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((data) => {
          this.headerFilterParams = data;
          this.createApiUrl();
          this.getChartData();
        })
    );
  }

  /**
   * Get chart data accroding to current chartType
   */
  getChartData() {
    this.chartContainerService.chartLoader.next(true);
    this.chartContainerService
      .getChartData(this.lc_api_url)
      .subscribe((data) => {
        let chartData: any;
        if (data) {
          switch (this.chartType) {
            case "horizontalBar":
              chartData = this.horizontalBarChartService.getChartData(
                data,
                this.id
              );
              break;
            case "verticalBar":
              chartData = this.horizontalBarChartService.getChartData(
                data,
                this.id
              );
              break;
            case "doughnut":
              chartData = this.doughnutChartService.getChartData(data);
              break;
            case "multiBar":
              chartData = this.multiBarService.getChartData(
                data,
                this.rangeParms,
                this.config
              );
              break;
            case "lineBar":
              chartData = this.lineBarChartService.getChartData(
                data,
                this.rangeParms,
                this.config
              );
              break;
            case "summary":
              chartData = data;
              break;
          }

          this.chartContainerService.chartDataEmitter.next({
            data: chartData,
            options: this.config,
          });
        }
        this.chartContainerService.chartLoader.next(false);
      });
  }

  /**
   * Runs when daterangepicker date changes.
   * @param event array of dates
   */
  setDateRange(event: number[]) {
    this.rangeParms = event;
    this.createApiUrl();
    this.getChartData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

export interface Config {
  filter: any;
  xAxis: string;
  yAxis: string;
  label: string;
  lineDataManupulation?: string;
  y2AxisHeading?: string;
  removeRanges?: any;
}
