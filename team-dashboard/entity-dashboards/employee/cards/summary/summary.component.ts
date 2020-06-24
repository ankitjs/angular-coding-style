import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { distinctUntilChanged, debounceTime } from "rxjs/operators";
import { DashboardService } from "../../../../../dashboard.service";

@Component({
  selector: "app-track-summary",
  templateUrl: "summary.component.html",
  styleUrls: ["summary.component.scss"]
})
export class TrackSummaryComponent implements OnInit, OnDestroy {
  lc_api_url: string;
  subscription: Subscription = new Subscription();
  api_url: string = `hrms/attendance`;
  summaryInfo: any;
  loading: boolean = true;
  constructor(
    private dashboardService: DashboardService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setHeaderFilterParams();
  }

  setHeaderFilterParams() {
    this.subscription.add(
      this.dashboardService.headerFilterSubject
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(data => {
          if (data && Object.keys(data).length) {
            let filter = data;
            this.lc_api_url = `${this.api_url}?territoryIds=${
              filter.territory
            }&siteIds=${filter.site}&teamIds=${filter.team}&employeeIds=${
              filter.employee
            }&startDate=${moment()
              .startOf("day")
              .valueOf()}&endDate=${moment()
              .endOf("day")
              .valueOf()}`;
          } else {
            this.lc_api_url = `${this.api_url}?startDate=${moment()
              .startOf("day")
              .valueOf()}&endDate=${moment()
              .endOf("day")
              .valueOf()}`;
          }
          this.getSummary();
        })
    );
  }

  getSummary() {
    this.loading = true;
    this.dashboardService.getSummary(this.lc_api_url).subscribe(data => {
      this.loading = false;
      this.summaryInfo = data;
      this.cdf.detectChanges();
    });
    this.cdf.detectChanges();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
