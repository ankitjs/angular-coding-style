/**
 * Created by Ankit Sharma
 */
import { refCount, publishReplay, map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import * as _ from "lodash";
@Injectable()
export class DashboardService {
  /**
   * dashboard header filter subject. Emit when click apply button to all cards
   */
  headerFilterSubject = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient) {}

  //START---> app-filter-header
  /**
   * get territories list of header filter
   */
  getTerritories(): Observable<any> {
    const api_url = `settings/tenants/territories?Status=active&userFilter=true`;
    return this.getData(api_url);
  }

  /**
   * get site list when territory selected
   * @param id terrritory id
   */
  getSiteList(id?: number[]): Observable<any> {
    const api_url = `settings/tenants/sites?Status=active&userFilter=true&territoryIds=${id}`;
    return this.getData(api_url);
  }

  /**
   * get team list when site selected
   * @param id site id
   */
  getTeamList(id: number[]): Observable<any> {
    const api_url = `settings/tenants/teams?Status=active&siteIds=${id}`;
    return this.getData(api_url);
  }

  /**
   * get employee list when team selected
   * @param id team id
   */
  getEmployeeList(id: number[]): Observable<any> {
    const api_url = `settings/tenants/teams/participants?pageNumber=0&pageSize=100&teamIds=${id}`;
    return this.getData(api_url);
  }

  /**
   * get employee list when team dropdown not present
   * @param filter
   */
  getCascadeEmployeeList(filter: any): Observable<any> {
    const api_url = `settings/tenant/employee?Status=active&territoryIds=${filter.territories}&siteIds=${filter.sites}`;
    return this.getData(api_url);
  }

  /**
   * common function to return api call observable
   */
  getData(api_url: string): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}${api_url}`).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }

  /**
   * common function to call api but with work-dashboard base url
   */
  getDashboardData(api_url: string) {
    return this.httpClient.get(`${environment.dashUrl}${api_url}`).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }

  /**
   * get status list
   */
  getStatusItems(api_url: string): Observable<any> {
    return this.getDashboardData(api_url);
  }

  //END---> app-filter-header

  //START---> resolver
  /**
   * get dashboard components and return array of ids of dashbard card components
   */
  getComponents(): Observable<any> {
    const api_url = `dashboard/components`;
    return this.getData(api_url).pipe(
      map((data: any[]) => {
        let ids = [];
        if (data.length) {
          data.forEach((comp: any) => {
            ids.push(comp.id);
          });
        }
        return ids || [];
      })
    );
  }
  //END---> resolver

  // START---> util function
  /**
   * to check if arr1 is included in arr2
   * @param arr1 array of entity cards id's
   * @param arr2 array of all cards id's
   */
  getIntersection(arr1: number[], arr2: number[]) {
    return _.intersection(arr1, arr2);
  }

  /**
   * use to check if a particular will show or not
   * @param allIds all dashboard card id's array
   * @param id card id
   */
  ifContains(allIds: number[], id: number) {
    return allIds.includes(id);
  }
  // END---> util function

  // START----> employee-dashboard
  /**
   * get imployee status
   */
  getEmployeeStatus(api_url: string): Observable<any> {
    return this.getEmployeeDashboardData(api_url);
  }

  /**
   * common function to call api but with work-dashboard base url
   */
  getEmployeeDashboardData(api_url) {
    return this.httpClient.get(`${environment.dashUrl}${api_url}`).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }
}
