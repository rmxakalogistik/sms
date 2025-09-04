import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionResolver implements Resolve<any> {

  constructor() {
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    return true;
    //// console.log('ConnectionResolver. Resolving...');
    // return this.signalrService.signalR_connection;
  }

}
