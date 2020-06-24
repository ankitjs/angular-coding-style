import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../../dashboard.service";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Cards } from "../../../card-id";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-contact-dashboard",
  templateUrl: "./contact.component.html",
})
export class ContactComponent implements OnInit {
  /**
   * current environment ref to use in template
   */
  env = environment;
  /**
   * Contains opened attendence dashboard card components ID's intesected with all card ids
   */
  cardIds: number[] = [];
  constructor(
    public dashboardService: DashboardService,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    const cardIds = Cards.INSPECTIONS;
    const allIds = this.route.parent.snapshot.data["components"] || [];
    this.cardIds = this.dashboardService.getIntersection(cardIds, allIds);
  }
}
