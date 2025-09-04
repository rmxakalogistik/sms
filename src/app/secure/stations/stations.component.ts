
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { User } from '../../_models/user';
import { StationService } from '../../_services/station.service';
import { debounceTime, distinctUntilChanged, startWith, switchMap, map, catchError } from 'rxjs/operators';
import { SignalrService } from '../../_services/common/signalr.service';
import { AuthService } from '../../_services/common/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SignalRConnection } from 'ng2-signalr';
import { MatTable } from '@angular/material/table';
import { isNullOrUndefined } from 'util';
import { MenuBottomSheetComponent } from '../../_common/dialogs/menu-bottom-sheet/menu-bottom-sheet.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SecureCommonService } from '../../_services/_secure-common.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { merge, of, Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { PopupService } from '../../_services/common/popup.service';
import { DatePipe } from '@angular/common';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { StationDialogComponent } from '../../_dialogs/station-dialog/station-dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { Lightbox } from 'ngx-lightbox';
import { EnvService } from '../../_services/common/env.service';
import { UserDialogComponent } from 'src/app/_dialogs/user-dialog/user-dialog.component';
import { ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
const moment = _rollupMoment || _moment;
moment.locale('fr');


@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class StationsComponent implements OnInit {

  // boolean
  isLoadingResults = false;
  isRateLimitReached = false;

  // string
  filterValue: string;
  editedRowId: string = null;
  fabTogglerState: string = 'inactive';
  defaultImage: string = './assets/img/logo.png';
  stationDisplayedColumns: string[] = [];

  // number
  resultsLength: number = 0;

  // any
  stations: any = [];
  fabButtons: any = [];
  buttons: any = [];
  private _albums: any = [];
  expandedElement: any;
  bottomSheetRef: any;

  // object
  user: User;

  // others
  private signalR_connection: SignalRConnection;
  stationSearchUpdate = new Subject<string>();
  env: EnvService;

  // ViewChild
  @ViewChild('stationtable', { static: true }) stationtable: MatTable<any>;
  @ViewChild('myPaginator', { static: false }) paginator: MatPaginator;
  @ViewChild('inputStationSearch', { static: true }) inputStationSearch: ElementRef;


  constructor(
    private stationService: StationService,
    public authService: AuthService,
    public dialog: MatDialog,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _bottomSheet: MatBottomSheet,
    private signalrService: SignalrService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private secureCommonService: SecureCommonService,
    private popupService: PopupService,
    private _lightbox: Lightbox,
    private _env: EnvService,
  ) {
    this.env = _env;
    // this.introJsConfig();
  }

  ngOnInit(): void {
    
    this.user = this.authService.userValue;

    this.stationDisplayedColumns = ['nom', 'zone', 'addresse','produit', 'capacite','pompe', 'action'];//'special',

    this.signalrService.notifConnexionChanged.subscribe((_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        const StationUpdatedlistener = this.signalR_connection.listenFor('newStationUpdated');
        StationUpdatedlistener.subscribe(async (data: string) => {
          if(this.editedRowId != data){
            this.editedRowId = data;
              this.loadStation();
          }
        });

      }
    });

    // Debounce search.
    this.stationSearchUpdate.pipe(
      debounceTime(100),
      distinctUntilChanged())
      .subscribe(value => {
        this.applyFilter(value);
      });


    this.fabButtons = [
      //{
      //  id: 'search',
      //  icon: 'search',
      //  tooltip: 'APPLIQUER UN FILTRE'
      //},
      {
        id: 'autorenew',
        icon: 'autorenew',
        tooltip: 'ACTUALISER'
      }

    ];

    if (this.authService.roleEXist('stations_manage').add) {
      this.fabButtons.push({
        id: 'add',
        icon: 'add',
        tooltip: 'AJOUTER',
        color: 'primary'
      });
    }


    this.loadStation();
    // this.introJS.start();
  }

  ngOnDestroy(): void { }



  applyFilter(valllue = null) {
    this.filterValue = (valllue) ? valllue : '';
    // this.stationtable.dataSource.filter = filterValue.trim().toLowerCase();
    this.loadStation(this.filterValue?.trim().toUpperCase());
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  // ****HORAIRE

  async loadStation(search = '') {
    if (this.bottomSheetRef) this.bottomSheetRef.dismiss();
    setTimeout(() => {

      if (this.paginator) {

        merge(this.paginator.page)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              if(this.txtFilters.length>0){
                search=this.txtFilters.map(x=>x).join('||');
              }
              return this.stationService!.getAll(this.paginator.pageIndex, this.paginator.pageSize || 5, search);
            }),
            map(data => {
              // Flip flag to show that loading has finished.
              this.isLoadingResults = false;
              this.isRateLimitReached = false;
              this.resultsLength = data.total_count;

              return data.items;
            }),
            catchError(() => {
              this.isLoadingResults = false;
              // Catch if the GitHub API has reached its rate limit. Return empty data.
              this.isRateLimitReached = true;
              return of([]);
            })
        ).subscribe(data => {
          this.stations = data;
          if (!isNullOrUndefined(this.stations)) {
            this.clearNewLogoAlbum();
            for (let i = 0; i < this.stations.length; i++) {
              let element = this.stations[i];
              this.setNewLogoAlbum(element);
            }
          }
        });
      }

    });

  }
  openStationDialog(action, obj) {
    obj.action = action;

    const dialogRef = this.popupService.open(StationDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
        if (result.event == 'Création') {
          this.addStationRowData(result.data);
        } else if (result.event == 'Modification') {
          this.updateStationRowData(result.data);
        } else if (result.event == 'Suppression') {
          this.deleteStationRowData(result.data);
        }
      }
    });
  }
  addStationRowData(row_obj) {
    //// console.log(row_obj);
    // var d = new Date();
    const hjj = this.stations.filter((value, key) => {
      return value.id == row_obj.id;
    })[0];
    if (isNullOrUndefined(hjj)) {
      this.stations.splice(0, 0, row_obj);
    }
    this.stationtable.renderRows();

  }
  updateStationRowData(row_obj) {
    this.stations = this.stations.filter((value, key) => {
      if (value.id == row_obj.id) {
        for (const name in value) {
          if (name != 'id') {
            // if (value.hasOwnProperty(name)) {
            //// console.log(name);
            value[name] = row_obj[name];
            // }
          }
        }
      }
      return true;
    });
  }
  deleteStationRowData(row_obj) {
    this.stations = this.stations.filter((value, key) => {
      return value.id != row_obj.id;
    });
  }
  openStationBottomSheet(element) {

    const _actions = [];
    
    // if (this.authService.roleEXist('comptes_manage')?.add) {
    //   _actions.push({ text: 'Ajouter un utilisateur', icon: 'person_add' });
    // }

    if (this.authService.roleEXist('stations_manage')?.edit) {
      _actions.push({ text: 'Modification', icon: 'create' });
    }

    if (this.authService.roleEXist('stations_manage')?.delete) {
      _actions.push({ text: 'Suppression', icon: 'delete' });
    }

    if (_actions.length > 0) {
      this.bottomSheetRef = this._bottomSheet.open(MenuBottomSheetComponent, {
        data: {
          list: _actions,
          titre: element.title
        },
      });

      this.bottomSheetRef.afterDismissed().subscribe(bottomSheetresult => {
        const result = bottomSheetresult;
        if (!isNullOrUndefined(result)) {
          if (result.text == "Ajouter un utilisateur") {
            this.openUserDialog('Création', { isActive: true, station:element, stationId:element.id }, element);
          }
          else {
            this.openStationDialog(result.text, element);
          }
        }
      });
    }
  }
  openGoTo(url, element) {

  }
  openUserDialog(action, obj, element) {
    obj.action = action;

    const dialogRef = this.popupService.open(UserDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
        if (result.event == 'Création') {
          element.countUtilisateurs++;
          console.log(element.countUtilisateurs);
        } 
      }
    });
  }

  setExpandedRox(element) {
    this.expandedElement = this.expandedElement === element ? null : element;
    // console.log(element);
    // console.log(this.expandedElement);
  }

  getDateExpiration(element): number {

    var startDate = moment(new Date(element), "DD/MM/YYYY");
    var currenDate = moment(new Date()).format("DD/MM/YYYY");
    var endDate = moment(currenDate, "DD/MM/YYYY");

    //console.log(startDate, endDate);

    var result = startDate.diff(endDate, 'months');

    //console.log(result);
    return result;
  }

  // ****END HORAIRE


  // introJsConfig() {
  //  this.introJS.setOptions({
  //    steps: [
  //      {
  //        intro: "Bienvenue dans la gestion des stations!"
  //      },
  //      //{
  //      //  element: document.querySelector('#AJOUTER-intro'),
  //      //  intro: "Permet d'ajouter un élément."
  //      //},
  //      //{
  //      //  element: document.querySelectorAll('#step2')[0],
  //      //  intro: "Ok, wasn't that fun?",
  //      //  position: 'right'
  //      //},
  //      {
  //        element: <any>document.querySelector('.ajouter_intro'),
  //        intro: "Permet d'ajouter un élément.",
  //        position: 'left'
  //      },
  //      //{
  //      //  element: '#step4',
  //      //  intro: "Another step.",
  //      //  position: 'bottom'
  //      //},
  //      //{
  //      //  element: '#step5',
  //      //  intro: 'Get it, use it.'
  //      //}
  //    ]
  //  });
  // }


  // ****FAB
  doFabAction(action) {
    if (action == 'add') {
      this.openStationDialog('Création', { isActive: true });
    } else if (action == 'autorenew') {
      this.applyFilter();
    } else if (action == 'search') {
      //this.openSearchDialog();
    }
    this.hideItems();
  }
  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }
  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }
  // ****END FAB


  open(index: number): void {
    // open lightbox
    console.log(index);
    this._lightbox.open(this._albums, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

  setNewLogoAlbum(element) {
    const src = (element.docphoto > 0) ? this._env.API_URL + '/upload/stations/logos/' + element.docphoto + '.jpeg' : this.defaultImage;
    const caption = element.title;
    const thumb = (element.docphoto > 0) ? this._env.API_URL + '/upload/stations/logos/' + element.docphoto + '.jpeg' : this.defaultImage;
    const album = {
      src: src,
      caption: caption,
      thumb: thumb
    };

    this._albums.push(album);
  }

  clearNewLogoAlbum() {
    this._albums = [];
  }

  onImgError(event) {
    event.target.src = this.defaultImage;
  }

  //*****SHIPS-START */
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER] as const;
  txtFilters: string[] = [];
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLocaleUpperCase();

    // Add our txtFilter
    if (value) {
      this.txtFilters.push(value);
      this.applyFilter(value);
    }

    console.log(event);
    // Clear the input value
    //event.chipInput!.clear();
    //event.input!.cle.clear();
    this.filterValue=null;
  }

  remove(txtFilter: string): void {
    const index = this.txtFilters.indexOf(txtFilter);

    if (index >= 0) {
      this.txtFilters.splice(index, 1);
      this.filterValue=null;
      this.applyFilter();
    }
  }
  removeAll(): void {
    this.txtFilters = [];
    this.filterValue=null;
    this.applyFilter();
  }
  //*****SHIPS-END */

}
