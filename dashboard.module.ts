/**
 * Created by Ankit Sharma
 */
import { NgModule } from "./team-dashboard/entity-dashboards/employee/node_modules/@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./dashboard.component";
import { SharedModule } from "../shared/components/shared.module";
import { BsDatepickerModule } from "ngx-bootstrap";
import { TranslateModule } from "./team-dashboard/entity-dashboards/employee/node_modules/@ngx-translate/core";
import { FilterheaderComponent } from "./team-dashboard/filter-header/filter-header.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { ComponentResolve } from "./dashboard.reslover";
import { StatusCardComponent } from "./team-dashboard/dashboard-cards/status/status.component";
import { ContactComponent } from "./team-dashboard/entity-dashboards/contact/contact.component";
import { ChartContainerComponent } from "./team-dashboard/dashboard-cards/chart-container/chart-container.component";
import { HorizontalBarComponent } from "./team-dashboard/charts/horizontal-bar/horizontal-bar.component";
import { DoughnutComponent } from "./team-dashboard/charts/doughnut/doughnut.component";
import { VerticalBarComponent } from "./team-dashboard/charts/vertical-bar/vertical-bar.component";
import { LineBarComponent } from "./team-dashboard/charts/line-bar/line-bar.component";
import { MultiBarComponent } from "./team-dashboard/charts/multi-bar/multi-bar.component";
import { TeamDashboardComponent } from "./team-dashboard/team-dashboard.component";
import { ExpensesComponent } from "./team-dashboard/entity-dashboards/contact/expenses.component";
import { ExpanseSummaryCardComponent } from "./team-dashboard/entity-dashboards/contact/summary-card/summary-card.component";
import { EmployeeComponent } from "./team-dashboard/entity-dashboards/employee/employee.component";
import { TrackSummaryComponent } from "./team-dashboard/entity-dashboards/employee/cards/summary/summary.component";

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    BsDatepickerModule,
    TranslateModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
  ],
  declarations: [
    TeamDashboardComponent,
    DashboardComponent,
    FilterheaderComponent,
    StatusCardComponent,
    ContactComponent,
    ChartContainerComponent,
    HorizontalBarComponent,
    DoughnutComponent,
    VerticalBarComponent,
    LineBarComponent,
    MultiBarComponent,
    ExpensesComponent,
    ExpanseSummaryCardComponent,
    EmployeeComponent,
    TrackSummaryComponent,
  ],
  providers: [ComponentResolve],
})
export class DashboardModule {}
