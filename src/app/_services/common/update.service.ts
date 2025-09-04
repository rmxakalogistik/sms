import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval, concat } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(appRef: ApplicationRef, public updates: SwUpdate) {
    if (updates.isEnabled) {

      // Allow the app to stabilize first, before starting polling for updates with `interval()`.
      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(() => updates.checkForUpdate()
        .then(() => console.log('checking for updates')));

      // interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
      //  .then(() => //console.log('checking for updates')));
    }
  }

  public checkForUpdates(): void {
    this.updates.available.subscribe(event => this.promptUser(event));
  }

  private promptUser(event): void {
    // console.log('current version is', event.current);
    // console.log('available version is', event.available);
     // console.log('updating to new version');
    this.updates.activateUpdate().then(() => document.location.reload());
    this.updates.activated.subscribe(event => {
      // console.log('old version was', event.previous);
      // console.log('new version is', event.current);
    });
  }

}
