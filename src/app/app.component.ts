import { Component } from '@angular/core';
import { User } from './_models/user';
import { AuthService } from './_services/common/auth.service';
// import { Role } from './_models/role';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { UpdateService } from './_services/common/update.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user: User;

  constructor(private authenticationService: AuthService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private sw: UpdateService) {

    if (environment.production) {
      if (location.protocol === 'http:') {
        window.location.href = location.href.replace('http', 'https');
        // document.location.reload();
      }
    }

    this.matIconRegistry.addSvgIcon(
      'google',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/google-color.svg')
    );

    // check the service worker for updates
    this.sw.checkForUpdates();

    // this.matIconRegistry.addSvgIcon(
    //  'sms',
    //  this.domSanitizer.bypassSecurityTrustResourceUrl("assets/img/logo.png")
    // );
    this.authenticationService.user.subscribe(x => this.user = x);
  }

  // get isUser() {
  //  return this.user && this.user.role === Role.User;
  // }

  // get isAdmin() {
  //  return this.user && this.user.role === Role.Admin;
  // }

  logout() {
    this.authenticationService.logout();
  }
}
