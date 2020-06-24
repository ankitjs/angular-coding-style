/**
 *
 * Created by Ankit Sharma
 * Component change detection type onPush
 */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from "./entity-dashboards/employee/node_modules/@angular/core";
import { PermissionsService } from "../../shared/services/permissions-service";
import { DashboardService } from "../dashboard.service";
import { ActivatedRoute } from "./entity-dashboards/employee/node_modules/@angular/router";
import { Subscription } from "./entity-dashboards/contact/summary-card/node_modules/rxjs/Subscription";

@Component({
  selector: "app-team-dashboard",
  templateUrl: "team-dashboard.component.html",
  providers: [DashboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboardComponent implements OnInit {
  cardIds: number[] = [];
  subscription: Subscription = new Subscription();
  currentEntityRoutes: string;
  noOfTabs: number = 0;
  constructor(
    public permissionsService: PermissionsService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getCardsIds();
  }

  getCardsIds() {
    this.cardIds = this.route.snapshot.data["components"] || [];
  }

  /**
   * check for tab show or not on the basis of permission and component id check
   * @param permissionName permission of enitity check from permission service
   * @param entity for card entity array
   */

  tabShow(permissionName: string, entity: string) {
    if (
      this.permissionsService.shouldShow(
        this.permissionsService.permission[permissionName]
      ) &&
      this.dashboardService.getIntersection(this.cardIds, Cards[entity]).length
    ) {
      return true;
    } else return false;
  }

  /**
   * get intersection of all ids of team array with card entity array
   * @param entity name of card entity enum
   */

  isShow(entity: string) {
    if (
      this.dashboardService.getIntersection(this.cardIds, Cards[entity]).length
    ) {
      return true;
    } else return false;
  }
}
