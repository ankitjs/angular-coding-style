/**
 *
 * Created by Ankit Sharma
 *
 */
import { map } from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs/operators";
import { Injectable } from "../../entity-dashboards/employee/node_modules/@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Observable,
  Subject,
} from "../../entity-dashboards/employee/cards/summary/node_modules/rxjs";

@Injectable()
export class ChartContainerService {
  constructor(private httpClient: HttpClient) {}

  chartDataEmitter = new Subject();
  chartLoader = new Subject();

  getChartData(api_url: string): Observable<any> {
    return this.httpClient.get(`${api_url}`).pipe(
      map((response: any) => {
        return response.data || [];
      })
    );
  }
}
