/**
 *  Created by Ankit Sharma
 */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from "../../entity-dashboards/employee/node_modules/@angular/core";
import { DashboardService } from "../../../dashboard.service";
import { Subscription } from "../../entity-dashboards/contact/summary-card/node_modules/rxjs/Subscription";
import * as moment from "../../entity-dashboards/employee/node_modules/moment";
import {
  distinctUntilChanged,
  debounceTime,
} from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs/operators";

@Component({
  selector: "app-status-card",
  templateUrl: "status.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCardComponent implements OnInit, OnDestroy {
  /**
   * Input api_url to fetch data of card.
   */
  @Input() api_url: string;
  /**
   * Input title to show title like(service request , task ) under icon
   */
  @Input() title: string;
  /**
   * Subscription object to unsubscribe all subscription of class
   */
  subscription: Subscription = new Subscription();
  /**
   * holds total calculated value of all status
   */
  total: number;
  /**
   * holds data coming from server.
   */
  statusCards: any[] = [];
  /**
   * Local api url contains current setted filters queryparams.
   */
  filtered_api_url: string;
  /**
   * ref to show hide loader on card.
   */
  loader: boolean = true;
  /**
   * ref to show hide nodata image on card.
   */
  noData: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef
  ) {}

  /**
   * Contains subscription for the change of dashboard filters
   * whenever header filter changes it will listen to those changes and create local api url with
   * current queryparams and fetch data from server.
   */
  ngOnInit() {
    this.subscription.add(
      this.dashboardService.headerFilterSubject
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((data) => {
          if (data && Object.keys(data).length) {
            let filter = data;
            this.filtered_api_url = `${this.api_url}?territoryIds=${
              filter.territory
            }&siteIds=${filter.site}&teamIds=${filter.team}&employeeIds=${
              filter.employee
            }&startDate=${moment()
              .startOf("day")
              .valueOf()}&endDate=${moment().endOf("day").valueOf()}`;
          } else {
            this.filtered_api_url = `${
              this.api_url
            }?startDate=${moment()
              .startOf("day")
              .valueOf()}&endDate=${moment().endOf("day").valueOf()}`;
          }
          this.statusItems();
        })
    );
  }

  /**
   * Fetch data using local api url set with queryparms.
   * Call by headerFilterSubject listener.
   */
  statusItems() {
    this.dashboardService
      .getStatusItems(this.filtered_api_url)
      .subscribe((data) => {
        this.loader = false;
        this.statusCards = data;
        this.SRTotal(data);
        if (!data.length) this.noData = true;
        else this.noData = false;
        if (!this.cd["destroyed"]) this.cd.detectChanges();
      });
  }

  /**
   * Add all status value to get to show total status.
   * @param data array of status with value key
   */
  SRTotal(data: any[]) {
    let total = 0;
    if (data.length) {
      data.forEach((card: any) => {
        total = total + card.value;
      });
    }
    this.total = total;
  }

  /**
   * Unsubscribe subscription (events) when component is destroying.
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
