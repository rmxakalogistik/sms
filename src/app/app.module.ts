import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DirectivesModule } from './_common/directives/_directives.module';
import { Material2Module } from './_shared/modules/material2.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';

import { SecureComponent } from './secure/secure.component';
//import { UsersComponent } from './secure/users/users.component';
import { AutorisationsComponent } from './secure/autorisations/autorisations.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorInterceptor } from './_common/helpers/error.interceptor';
import { AuthInterceptor } from './_common/helpers/auth.interceptor';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { ConfirmDialogComponent } from './_common/dialogs/confirm-dialog/confirm-dialog.component';
import { MenuBottomSheetComponent } from './_common/dialogs/menu-bottom-sheet/menu-bottom-sheet.component';
// import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { SignalRModule } from 'ng2-signalr';
import { SignalRConfiguration } from 'ng2-signalr';
import { UserDialogComponent } from './_dialogs/user-dialog/user-dialog.component';

import { PipesModule } from './_pipes/pipes.module';
import { PreviewerComponent } from './secure/_common/previewer/previewer.component';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

//import { LightboxModule } from 'ngx-lightbox';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

// import { MomentModule } from 'ngx-moment';
import 'moment/locale/fr';
import localeFr from '@angular/common/locales/fr';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { DocumentFooterComponent } from './secure/_common/documentFooter/documentFooter.component';
import { DocumentHeaderComponent } from './secure/_common/documentHeader/documentHeader.component';
import { RapportsComponent } from './secure/rapports/rapports.component';
import { SearchDialogComponent } from './_common/dialogs/search-dialog/search-dialog.component';
import { LightboxModule } from 'ngx-lightbox';
//import { OnsitepvComponent } from './secure/onsitepv/onsitepv.component';
import { SelectDialogComponent } from './_common/dialogs/select-dialog/select-dialog.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
//import { QrcodeDialogComponent } from './_common/dialogs/qrcode-dialog/qrcode-dialog.component';
import { IdentifierComponent } from './secure/identifier/identifier.component';
// import { AngularOpenlayersModule } from "ngx-openlayers";
import { LazyLoadImageModule } from 'ng-lazyload-image'; 
import { UserAutorisationDialogComponent } from './_dialogs/user-autorisation-dialog/user-autorisation-dialog.component';
import { ZonesComponent } from './secure/zones/zones.component';
import { ZoneDialogComponent } from './_dialogs/zone-dialog/zone-dialog.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
// import { ArticlesComponent } from './secure/articles/articles.component';
// import { ArticleDialogComponent } from './_dialogs/article-dialog/article-dialog.component';
import { ImgCropperDialogComponent } from './_common/dialogs/imgCropper-dialog/img-cropper-dialog.component';
import { EditableComponent } from './_common/templates/editable/editable.component';
import { CheckboxComponent } from './_common/templates/checkbox/checkbox.component';
import { TicketPrintableComponent } from './_common/templates/ticketPrintable/ticketPrintable.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UsersComponent } from './secure/users/users.component';
import { QrcodeDialogComponent } from './_common/dialogs/qrcode-dialog/qrcode-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { appInitializer } from './_services/common/app.initializer';
import { AuthService } from './_services/common/auth.service';
import { DefaultMatCalendarRangeStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { StationsComponent } from './secure/stations/stations.component';
import { StationDialogComponent } from './_dialogs/station-dialog/station-dialog.component';
import { ProduitsComponent } from './secure/produits/produits.component';
import { ProduitDialogComponent } from './_dialogs/produit-dialog/produit-dialog.component';
import { FournisseurDialogComponent } from './_dialogs/fournisseur-dialog/fournisseur-dialog.component';
import { FournisseursComponent } from './secure/fournisseurs/fournisseurs.component';
import { ClientDialogComponent } from './_dialogs/client-dialog/client-dialog.component';
import { ClientsComponent } from './secure/clients/clients.component';
import { BanqueDialogComponent } from './_dialogs/banque-dialog/banque-dialog.component';
import { BanquesComponent } from './secure/banques/banques.component';
import { CommandeDialogComponent } from './_dialogs/commande-dialog/commande-dialog.component';
import { CommandesComponent } from './secure/commandes/commandes.component';
import { CommandePrintableComponent } from './_common/templates/commandePrintable/commandePrintable.component';
import { RjvsComponent } from './secure/rjvs/rjvs.component';
import { ReceptionDialogComponent } from './_dialogs/rjv/reception-dialog/reception-dialog.component';
import { GroupeelecDialogComponent } from './_dialogs/rjv/groupeelec-dialog/groupeelec-dialog.component';
import { PrelevementDialogComponent } from './_dialogs/rjv/prelevement-dialog/prelevement-dialog.component';
import { RemisecuveDialogComponent } from './_dialogs/rjv/remisecuve-dialog/remisecuve-dialog.component';
import { IndexDialogComponent } from './_dialogs/rjv/index-dialog/index-dialog.component';
import { ClotureDialogComponent } from './_dialogs/rjv/cloture-dialog/cloture-dialog.component';
import { DepenseDialogComponent } from './_dialogs/rjv/depense-dialog/depense-dialog.component';
import { VersementDialogComponent } from './_dialogs/rjv/versement-dialog/versement-dialog.component';
import { ManquantDialogComponent } from './_dialogs/rjv/manquant-dialog/manquant-dialog.component';
//import { CustomPaginator } from './_common/controls/customPaginator';

// import { WalkthroughModule } from 'ngx-walkthrough';

moment.locale('fr');

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'L',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

registerLocaleData(localeFr, 'fr');



// >= v2.0.0
export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  // c.hubName = 'notifHub';
  // c.qs = { id: null };
  //// c.url = environment.baseUrl +'/SignalR/notifHub';
  // c.logging = true;

  // >= v5.0.0
  c.executeEventsInZone = true; // optional, default is true
  c.executeErrorsInZone = false; // optional, default is false
  c.executeStatusChangeInZone = true; // optional, default is true
  return c;
}

// export class SignalRMock {
//  public createConnection(options?: any): any {
//    return null;
//  }

//  public connect(options?: any): Promise<any> {
//    return new Promise<any>(null);
//  }
// }

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    //OnsitepvComponent,
    IdentifierComponent,
    SecureComponent,
    UsersComponent,
    
    RjvsComponent,
    ReceptionDialogComponent,
    GroupeelecDialogComponent,
    PrelevementDialogComponent,
    RemisecuveDialogComponent,
    IndexDialogComponent,
    ClotureDialogComponent,
    DepenseDialogComponent,
    VersementDialogComponent,
    ManquantDialogComponent,
    
    ProduitsComponent,
    ProduitDialogComponent,
    ZonesComponent,
    ZoneDialogComponent,
    ClientsComponent,
    ClientDialogComponent,
    CommandesComponent,
    CommandeDialogComponent,
    FournisseursComponent,
    FournisseurDialogComponent,
    BanquesComponent,
    BanqueDialogComponent,
    StationsComponent,
    CommandePrintableComponent,
    StationDialogComponent,
    AutorisationsComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    ConfirmDialogComponent,
    UserDialogComponent,
    UserAutorisationDialogComponent,
    MenuBottomSheetComponent,
    PreviewerComponent,
    DocumentHeaderComponent,
    DocumentFooterComponent,
    RapportsComponent,
    SearchDialogComponent,
    SelectDialogComponent,
    QrcodeDialogComponent,
    ImgCropperDialogComponent,
    EditableComponent,
    CheckboxComponent,
    TicketPrintableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    MatCarouselModule.forRoot(),
    Material2Module,
    MatMenuModule,
    DeviceDetectorModule,
    SignalRModule.forRoot(createConfig),
    PipesModule,
    // WalkthroughModule,
    SignaturePadModule,
    // AngularOpenlayersModule,
    LightboxModule,
    NgxQRCodeModule,
    ZXingScannerModule,
    ChartsModule,
    NgxChartsModule,
    LazyLoadImageModule,
    ImageCropperModule,
    MatButtonToggleModule
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
   },
    //{ provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ],
  entryComponents: [MenuBottomSheetComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
