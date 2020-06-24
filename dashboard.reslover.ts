/**
 * Created by Ankit Sharma
 */
import { map } from "rxjs/operators";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as _ from "lodash";
@Injectable()
export class ComponentResolve implements Resolve<any> {
  constructor(private httpClient: HttpClient) {}
  /**
   * set component to array of dashboard card ID's
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const api_url = `dashboard/components`;
    return this.httpClient.get(api_url).pipe(
      map((data: any) => data.data),
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
}
