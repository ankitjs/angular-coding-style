/**
 * Created by Ankit Sharma
 */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: "app-filter-header",
  templateUrl: "filter-header.component.html",
  styleUrls: ["filter-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterheaderComponent implements OnInit, OnDestroy {
  /**
   * array for type dashboard dropdwon
   */
  dashboardTypes: any[];
  /**
   * dashboard filter form ref
   */
  filterForm: FormGroup;
  /**
   * terrritory dropdown item list ref default set to []
   */
  territoryList: any[] = [];
  /**
   *common subscription object to unsubscribe all subscription of class
   */
  subscription: Subscription = new Subscription();
  /**
   * site dropdown item list ref default set to []
   */
  siteList: any[] = [];
  /**
   * team dropdown item list ref default set to []
   */
  teamList: any[] = [];
  /**
   * employee dropdown item list ref default set to []
   */
  employeeList: any[] = [];
  /**
   * site dropdown loading variable
   */
  siteLoading: boolean = false;
  /**
   * team dropdown loading variable
   */
  teamLoading: boolean = false;
  /**
   * employee dropdown loading variable
   */
  empLoading: boolean = false;
  constructor(
    private dashboardService: DashboardService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.formInit();
    this.dashboardTypeItems();
    this.territoryItems();
    this.siteItems();
    this.teamItems();
    this.employeeItems();
  }

  /**
   * call when apply button click (emit headerfiltersubject to all cards to get data according to new filters)
   */
  filter() {
    this.dashboardService.headerFilterSubject.next(this.filterForm.value);
  }

  /**
   * filter dropdown form initialization
   */
  formInit() {
    this.filterForm = new FormGroup({
      dashboard_type: new FormControl(1),
      territory: new FormControl([]),
      site: new FormControl([]),
      team: new FormControl([]),
      employee: new FormControl([]),
    });
  }

  /**
   * set dashboard type list
   */
  dashboardTypeItems() {
    this.dashboardTypes = [
      { id: 1, name: "My Dashboard" },
      { id: 2, name: "Team Dashboard" },
    ];
    // initially set to team dashboard type
  }

  /**
   * set territories list observable
   */
  territoryItems() {
    this.dashboardService.getTerritories().subscribe((territoryList: any[]) => {
      this.territoryList = territoryList;
      this.cdf.detectChanges();
      if (!this.territoryList.length)
        this.dashboardService.getSiteList([]).subscribe((siteList: any[]) => {
          this.siteList = siteList;
          this.cdf.detectChanges();
        });
    });
  }

  /**
   * detect changes of territory and fetch sites against that territory
   */
  siteItems() {
    this.subscription.add(
      this.filterForm.controls["territory"].valueChanges.subscribe(
        (id: number[]) => {
          this.filterForm.controls["site"].patchValue([]);
          this.siteList = [];
          if (id && id.length) {
            this.siteLoading = true;
            this.dashboardService
              .getSiteList(id)
              .subscribe((siteList: any[]) => {
                this.siteLoading = false;
                this.siteList = siteList;
                this.cdf.detectChanges();
              });
          }
        }
      )
    );
  }

  /**
   * detect changes in site control and fetch team accordingly
   */
  teamItems() {
    this.subscription.add(
      this.filterForm.controls["site"].valueChanges.subscribe(
        (id: number[]) => {
          this.filterForm.controls["team"].patchValue([]);
          this.teamList = [];
          if (id && id.length) {
            this.teamLoading = true;
            this.dashboardService
              .getTeamList(id)
              .subscribe((teamList: any[]) => {
                this.teamLoading = false;
                this.teamList = teamList;
                this.cdf.detectChanges();
              });
          }
        }
      )
    );
  }

  /**
   * detect changes of team and fetech employees of teams
   */
  employeeItems() {
    this.subscription.add(
      this.filterForm.controls["team"].valueChanges.subscribe(
        (id: number[]) => {
          this.filterForm.controls["employee"].patchValue([]);
          this.employeeList = [];
          if (id && id.length) {
            this.empLoading = true;
            this.dashboardService
              .getEmployeeList(id)
              .subscribe((employeeList: any[]) => {
                this.empLoading = false;
                this.employeeList = employeeList;
                this.cdf.detectChanges();
              });
          } else {
            this.empLoading = true;
            this.dashboardService
              .getCascadeEmployeeList({
                territories: this.filterForm.controls["territory"].value,
                sites: this.filterForm.controls["site"].value,
              })
              .subscribe((employeeList: any[]) => {
                this.empLoading = false;
                this.employeeList = employeeList;
                this.cdf.detectChanges();
              });
          }
        }
      )
    );
  }

  /**
   * ng-select multiple select selectAll feature
   * @param controlName name of formControlName
   * @param list List of enitity against ng-select
   */
  selectAll(controlName: string, list: any[]) {
    if (this.filterForm.controls[controlName]) {
      let ids = list.map((x) => x.id);
      this.filterForm.controls[controlName].patchValue(ids);
      //  this.onChange();
    }
  }

  /**
   * ng-select mulitple select unselect all feature
   * @param controlName name of formControlName
   */
  unselectAll(controlName: string) {
    this.filterForm.controls[controlName].patchValue([]);
    // this.onChange();
  }

  /**
   * if label is custom made and custom search is required on ng-select dropdown
   * @param term user input
   * @param item ng-select item list
   */
  customSearchFn(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return item.name.firstName.toLocaleLowerCase().indexOf(term) > -1;
  }

  /**
   * name creator of ng-select label
   */
  getName(name: any) {
    if (name && name.constructor === String) {
      return name;
    } else if (name && name.constructor === Object) {
      if (name.salutation) {
        return `${name.firstName} ${name.lastName ? name.lastName : ""}`;
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
