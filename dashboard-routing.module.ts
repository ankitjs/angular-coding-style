/**
 *
 * Created by Ankit Sharma
 *
 */
import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard.component";
import { ComponentResolve } from "./dashboard.reslover";
import { ContactComponent } from "./team-dashboard/entity-dashboards/contact/contact.component";
import { EmployeeComponent } from "./team-dashboard/entity-dashboards/employee/employee.component";
import { TeamDashboardComponent } from "./team-dashboard/team-dashboard.component";
const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
  },
  {
    path: "team",
    component: TeamDashboardComponent,
    resolve: {
      components: ComponentResolve,
    },
    children: [
      {
        path: "employee",
        component: EmployeeComponent,
      },

      {
        path: "contact",
        component: ContactComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
