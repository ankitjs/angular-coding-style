/**
 *
 * Created by Ankit Sharma
 *
 */
import { Component, OnInit } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { ActivatedRoute } from "@angular/router";
import { DashboardService } from "../../../dashboard.service";
import { TranslateService } from "@ngx-translate/core";
import { Cards } from "../../../card-id";
import * as moment from "moment";
@Component({
  selector: "app-employee",
  templateUrl: "employee.component.html",
})
export class EmployeeComponent implements OnInit {
  /**
   * current environment ref to use in template
   */
  env = environment;
  /**
   * Contains opened attendence dashboard card components ID's intesected with all card ids
   */
  cardIds: number[] = [];
  /**
   * api url for fethching today attendence status (passing in chartContainer component to build multibar chart)
   */
  todaySiteUrl: string;
  constructor(
    private route: ActivatedRoute,
    public dashboardService: DashboardService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.getCardsIds();
    this.todaySiteUrl = `${
      environment.dashUrl
    }hrms/attendance/site-trends?startDate=${moment()
      .startOf("day")
      .valueOf()}&endDate=${moment().endOf("day").valueOf()}`;
  }

  getCardsIds() {
    const cardIds = Cards.ATTENDENCE;
    const allIds = this.route.parent.snapshot.data["components"] || [];
    this.cardIds = this.dashboardService.getIntersection(cardIds, allIds);
  }
}
