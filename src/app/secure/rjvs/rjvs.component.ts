
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { User } from '../../_models/user';
import { RjvService } from '../../_services/rjv.service';
import { debounceTime, distinctUntilChanged, startWith, switchMap, map, catchError, first } from 'rxjs/operators';
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
import { MediaMatcher } from '@angular/cdk/layout';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { Lightbox } from 'ngx-lightbox';
import { EnvService } from '../../_services/common/env.service';
import { UserDialogComponent } from 'src/app/_dialogs/user-dialog/user-dialog.component';
import { ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ReceptionDialogComponent } from 'src/app/_dialogs/rjv/reception-dialog/reception-dialog.component';
import { SelectDialogComponent } from 'src/app/_common/dialogs/select-dialog/select-dialog.component';
import { Guid } from 'guid-typescript';
import * as _ from 'lodash';
import { GroupeelecDialogComponent } from 'src/app/_dialogs/rjv/groupeelec-dialog/groupeelec-dialog.component';
import { PrelevementDialogComponent } from 'src/app/_dialogs/rjv/prelevement-dialog/prelevement-dialog.component';
import { RemisecuveDialogComponent } from 'src/app/_dialogs/rjv/remisecuve-dialog/remisecuve-dialog.component';
import { IndexDialogComponent } from 'src/app/_dialogs/rjv/index-dialog/index-dialog.component';
import { MatCalendarCellClassFunction, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { ClotureDialogComponent } from 'src/app/_dialogs/rjv/cloture-dialog/cloture-dialog.component';
import { DepenseDialogComponent } from 'src/app/_dialogs/rjv/depense-dialog/depense-dialog.component';
import { VersementDialogComponent } from 'src/app/_dialogs/rjv/versement-dialog/versement-dialog.component';
import { SelectionService } from 'src/app/_services/_selection.service';
import { ManquantDialogComponent } from 'src/app/_dialogs/rjv/manquant-dialog/manquant-dialog.component';

const moment = _rollupMoment || _moment;
moment.locale('fr');


@Component({
  selector: 'app-rjvs',
  templateUrl: './rjvs.component.html',
  styleUrls: ['./rjvs.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RjvsComponent implements OnInit {

  // boolean
  isLoadingResults = false;
  isRateLimitReached = false;
  newUpdated = false;

  // string
  fabTogglerState: string = 'inactive';
  defaultImage: string = './assets/img/logo.png';

  // number
  resultsLength: number = 0;
  sameMonthDatas: any[];

  // any
  commonList: any = {};
  rjvsList: any = [];
  selectedRjv: any = {};

  fabButtons: any = [];
  buttons: any = [];
  private _albums: any = [];
  expandedElement: any;
  bottomSheetRef: any;
  dataToPrintPosTicket: any = null;
  selectedStation: any;
  get_commonList_Subject: any;

  // date
  maxDate: Date;
  currenteDate: Date;

  // object
  user: User;

  // others
  private signalR_connection: SignalRConnection;
  rjvSearchUpdate = new Subject<string>();
  env: EnvService;

  // ViewChild


  constructor(
    private rjvService: RjvService,
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
    private selectionService: SelectionService,
    private _env: EnvService,
  ) {
    this.env = _env;
    // this.introJsConfig();
    this.maxDate = this.authService.getMaxDate || new Date();
    this.currenteDate = this.authService.getMaxDate || new Date();

  }

  ngOnInit(): void {

    this.user = this.authService.userValue;
    if (!isNullOrUndefined(this.user.station)) this.selectedStation = this.user.station;

    this.signalrService.notifConnexionChanged.subscribe(async (_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        let datas = this.rjvService.rjvsValue;
        //console.log(datas);
        if (datas && datas.length > 0) {
          for (let i = 0; i < datas.length; i++) {
            let x = datas[i];
            this.onSubmit(x, ((datas.length - 1) == i));
          }
        }

        if (this.selectedStation != null && this.selectedStation != undefined) {
          this.getCommonList();
          this.getAllDate();
        }

        const RjvUpdatedlistener = this.signalR_connection.listenFor('newRjvUpdated');
        RjvUpdatedlistener.subscribe(async (data: string) => {
          if (this.selectedRjv.id == data) {
            this.loadRjv();
          }
        });

      }
    });

    this.fabButtons = [
      {
        id: 'autorenew',
        icon: 'autorenew',
        tooltip: 'ACTUALISER'
      }

    ];


    if (this.user.station) {
      this.selectedStation = this.user.station;
    } else {
      //console.log('CSUTOMERID: ' + this.URL_read_parameter(location.href, 'stationId'));

      let __thisUrl = this.URL_read_parameter(location.href, 'stationId');
      if (!isNullOrUndefined(__thisUrl)) {
        this.selectedStation = this.secureCommonService.manageStationId();
      } else {
        this.selectedStation = this.secureCommonService.manageStationId();//this.selectedStation = this.secureCommonService.manageStationId('clear');
      }
    }
    if (isNullOrUndefined(this.selectedStation)) {
      this.selectionDialog('station', {});
    }

    this.commonList = this.secureCommonService.manageCommonList(this.selectedStation.id + 'commonList');
    if (this.commonList != undefined && this.commonList != null
      && this.commonList.stations != undefined && this.commonList.stations != null) {
      this.selectedStation = this.secureCommonService.manageStationId('add', this.commonList.stations);
    }

    if (this.selectedStation != null && this.selectedStation != undefined) {
      this.getCommonList();
      this.commonList = this.secureCommonService.manageCommonList(this.selectedStation.id + 'commonList');

    }

    this.loadRjv();
    // this.introJS.start();
    this.getAllDate();
  }

  ngOnDestroy(): void { }

  setEmptyRjv() {

    let __date_ = new Date(this.currenteDate);
    let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
    let ___date___ = new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

    this.selectedRjv = {
      id: Guid.create().toString(),
      date: ___date___,
      dateValidation: null,
      station: this.selectedStation,
      stationId: this.selectedStation.id,
      clotureProduits: null,
      indexProduits: null,
      receptionProduits: null,
      remisecuveProduits: null,
      groupeelecProduits: null,
      prelevementProduits: null,
      depenses: null,
      manquants: null,
      versements: null,
    };
  }


  applyFilter() {
    this.loadRjv();
  }

  getNewRjv() {

    let __date_ = new Date(this.currenteDate);
    let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);

    this.currenteDate = __date__;

    //console.log(this.currenteDate);
    this.applyFilter();
  }


  getCommonList() {
    //this.loading = true;

    if (this.get_commonList_Subject && !this.get_commonList_Subject.closed) {
      this.get_commonList_Subject.unsubscribe();
    }

    //  setTimeout(() => {

    // if (this.get_commonList_Subject && !this.get_commonList_Subject.closed) {
    //   this.get_commonList_Subject.unsubscribe();
    // }

    let _topost = {
      stationId: this.selectedStation.id,
      actionId: 'get_commonList'
    };

    this.get_commonList_Subject = this.selectionService.getAll(_topost).pipe(first()).subscribe(response => {
      //this.loading = false;
      let returnedData = response;
      console.log(returnedData);
      this.commonList = this.secureCommonService.manageCommonList(this.selectedStation.id + 'commonList', returnedData);
      if (this.commonList != undefined && this.commonList != null
        && this.commonList.stations != undefined && this.commonList.stations != null) {
        this.selectedStation = this.secureCommonService.manageStationId('add', this.commonList.stations);
        this.selectedRjv.station = this.selectedStation;
        this.selectedRjv.stationId = this.selectedStation.id;
      }
    });

    //  }, 1500);


    //}
    //else {
    //  this.totalData = this.selectionList?.options?.length;
    //}
  }


  // ****HORAIRE
  async getAllDate() {

    if (this.selectedStation && this.selectedStation.id) {

      const topo = {
        stationId: this.selectedStation.id,
      }

      this.rjvService.getAllDate(topo).pipe(first()).subscribe(data => {
        this.sameMonthDatas = [];
        let _datats: any = data;
        for (let i = 0; i < _datats.length; i++) {
          this.sameMonthDatas.push(_datats[i]);
        }
      });
    }

  }

  async loadRjv() {
    if (this.bottomSheetRef) this.bottomSheetRef.dismiss();
    setTimeout(() => {

      if (this.selectedStation) {

        this.fabButtons = this.fabButtons.filter((x) => {
          return x.id != 'done_all';
        });

        this.hideItems();


        let __date_ = new Date(this.currenteDate);
        let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
        let ___date___ = new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

        merge(0)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;

              let __date1 = new Date(this.currenteDate);
              //let __date = new Date(__date1.getFullYear(), __date1.getMonth(), __date1.getDate(), 8, 0, 0);
              let _date = new Date(__date1.getTime() - (__date1.getTimezoneOffset() * 60000)).toJSON();

              const topo = {
                date: _date,
                stationId: this.selectedStation.id,
              }

              return this.rjvService!.getAll(topo);
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

            //console.log(data);

            let _selectedRjv: any = null;
            if (data && data[0]) {
              _selectedRjv = data[0];
            }

            //console.log(_selectedRjv);

            this.rjvsList = this.rjvService.rjvsValue;
            if (_selectedRjv == null || _selectedRjv == undefined) {
              _selectedRjv = this.rjvsList.filter((x) => {
                x.date == this.currenteDate;
              })[0];
            }

            if (_selectedRjv != null && _selectedRjv != undefined) {
              this.selectedRjv = _selectedRjv;
            } else {
              this.setEmptyRjv();
            }


            this.selectedRjv.station = this.selectedStation;
            this.selectedRjv.stationId = this.selectedStation.id;

            //console.log(this.selectedRjv);

            if (this.authService.roleEXist('rjvs_validation')) {
              if (this.selectedRjv && this.selectedRjv.id > 0 && (this.selectedRjv.dateValidation == undefined || this.selectedRjv.dateValidation == null)) {
                let _dsdsd_print = this.fabButtons.filter((value, key) => {
                  return value.id == 'done_all';
                })[0];
                if (isNullOrUndefined(_dsdsd_print)) {
                  this.fabButtons.push({
                    id: 'done_all',
                    icon: 'done_all',
                    tooltip: 'VALIDER LA SAISIE',
                    color: 'primary'
                  });
                }
              }
            }

          });
      }

    });

  }

  getRcByProducts(_lib) {
    let data = (this.getSubTotals('stationProduit.produit.nom', 'qte')(this.selectedRjv.remisecuveProduits)).filter((x) => {
      return x.lib == _lib;
    })[0];
    if (data != undefined && data != null) {
      return data.total;
    }
    return 0;
  };

  getVenteByProducts(_lib) {
    let data = (this.getSubTotals('stationProduit.produit.nom', 'qte')(this.selectedRjv.indexProduits)).filter((x) => {
      return x.lib == _lib;
    })[0];
    if (data != undefined && data != null) {
      return data.total;
    }
    return 0;
  };

  getReceptionByProducts(_lib) {
    let data = (this.getSubTotals('commandeProduit.stationProduit.produit.nom', 'qte')(this.selectedRjv.receptionProduits)).filter((x) => {
      return x.lib == _lib;
    })[0];
    if (data != undefined && data != null) {
      return data.total;
    }
    return 0;
  };

  getSubTotals = (p, key, _debut = null, _fin = null) => _.flow(
    products => _.filter(products, o => _.has(o, p)),
    sm_prod => _.groupBy(sm_prod, p),
    gr => _.map(gr, (arr, prop) => ({ lib: prop, debut: (_debut ? _.sumBy(arr, (a) => +a[_debut]) : 0), fin: (_fin ? _.sumBy(arr, (a) => +a[_fin]) : 0), total: _.sumBy(arr, (a) => +a[key]) }))
  );

  openReceptionDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(ReceptionDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'datareceptionLoading');
      }
    });
  }

  openGroupeelecDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(GroupeelecDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'datagroupeelecLoading');
      }
    });
  }

  openPrelevementDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(PrelevementDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'dataprelevementLoading');
      }
    });
  }

  openRemisecuveDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(RemisecuveDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'dataremisecuveLoading');
      }
    });
  }

  openClotureDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(ClotureDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.selectedStation = this.secureCommonService.manageStationId('add', result.data.station);
        this.onSubmit(this.selectedRjv, true, 'dataclotureLoading');
      }
    });
  }

  openIndexDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(IndexDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.selectedStation = this.secureCommonService.manageStationId('add', result.data.station);
        this.onSubmit(this.selectedRjv, true, 'dataindexLoading');
      }
    });
  }

  openDepenseDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(DepenseDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'datadepenseLoading');
      }
    });
  }

  openManquantDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(ManquantDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'datamanquantLoading');
      }
    });
  }

  openVersementDialog() {
    this.selectedRjv.commonList = this.commonList;
    const dialogRef = this.popupService.open(VersementDialogComponent, '800px', {
      data: this.selectedRjv,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result);
        this.selectedRjv = result.data;
        this.onSubmit(this.selectedRjv, true, 'dataversementLoading');
      }
    });
  }

  onSubmit(cp, isLast, whoIs = null) {
    //console.log(cp);

    if (isNullOrUndefined(cp)) return;

    let old_cp: any = { loading: false };
    if (this.selectedRjv.id == cp.id) {
      old_cp = this.selectedRjv;
    }

    old_cp.loading = true;
    if (whoIs != null) {
      old_cp[whoIs] = true;
    }

    setTimeout(() => {

      if (cp.id > 0) {
        this.rjvService.update(cp.id, cp).pipe(first()).subscribe(data => {
          old_cp.loading = false;
          old_cp[whoIs] = false;
          if (isLast == true) {
            let _dt: any[] = this.rjvService.rjvsValue;
            _dt = _dt.filter((value, key) => {
              return value.id > 0;
            });
            this.rjvService.setrjv(_dt, this.selectedStation.id);
            //this.applyFilter();
          }
          cp.id = data.id;
          cp = data;
          if (old_cp.id != null && old_cp.id != undefined) {
            old_cp = data;
            //console.log(old_cp, cp);
          }

          if (this.isLoadingResults == true) this.isLoadingResults = false;
        },
          error => {
            //console.log(error);
            old_cp.loading = false;
            old_cp[whoIs] = false;
            if (this.isLoadingResults == true) this.isLoadingResults = false;
          });
      } else {
        this.rjvService.add(cp).pipe(first()).subscribe(data => {
          old_cp.loading = false;
          old_cp[whoIs] = false;
          if (isLast == true) {
            let _dt: any[] = this.rjvService.rjvsValue;
            _dt = _dt.filter((value, key) => {
              return value.id > 0;
            });
            this.rjvService.setrjv(_dt, this.selectedStation.id);
            //this.applyFilter();
          }
          cp.id = data.id;
          cp = data;
          if (old_cp.id != null && old_cp.id != undefined) {
            old_cp = data;
            //console.log(old_cp);
          }
        },
          error => {
            //console.log(error);
            old_cp.loading = false;
            old_cp[whoIs] = false;
          });
      }

    }, 1500);

  }

  // onSubmit(cp: any, isLast) {
  //   console.log(cp);
  //   return;
  //   let old_cp = this.selectedRjv;

  //   old_cp.loading = true;

  //   cp.stationId = cp.station.id;

  //   setTimeout(() => {

  //     if (cp.id > 0) {
  //       this.rjvService.update(cp.id, cp).pipe(first()).subscribe(data => {
  //         old_cp.loading = false;

  //         let _dt: any = this.rjvService.rjvValue;
  //         if (_dt.id > 0) {
  //           this.rjvService.setrjv(_dt);
  //         }

  //         old_cp.id = data.id;
  //         old_cp = data;
  //       },
  //         error => {
  //           console.log(error);
  //           old_cp.loading = false;
  //         });
  //     } else {
  //       this.rjvService.add(cp).pipe(first()).subscribe(data => {
  //         old_cp.loading = false;

  //         let _dt: any = this.rjvService.rjvValue;
  //         if (_dt.id > 0) {
  //           this.rjvService.setrjv(_dt);
  //         }

  //         old_cp.id = data.id;
  //         old_cp = data;
  //       },
  //         error => {
  //           console.log(error);
  //           old_cp.loading = false;
  //         });
  //     }

  //   }, 1500);

  // }

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
          //console.log(element.countUtilisateurs);
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
  //        intro: "Bienvenue dans la gestion des rjvs!"
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
    if (action == 'done_all') {

      let __date_ = new Date(this.maxDate);
      let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
      let ___date___ = new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

      this.selectedRjv.dateValidation = ___date___;
      this.isLoadingResults = true;
      this.onSubmit(this.selectedRjv, true);
    } else if (action == 'autorenew') {
      this.applyFilter();
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
    //console.log(index);
    this._lightbox.open(this._albums, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

  setNewLogoAlbum(element) {
    const src = (element.docphoto > 0) ? this._env.API_URL + '/upload/rjvs/logos/' + element.docphoto + '.jpeg' : this.defaultImage;
    const caption = element.title;
    const thumb = (element.docphoto > 0) ? this._env.API_URL + '/upload/rjvs/logos/' + element.docphoto + '.jpeg' : this.defaultImage;
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


  async selectionDialog(action, obj: any = {}) {
    this.hideItems();

    obj.actionId = action;

    if (action == 'station') {
      obj.action = "Choix d'une station";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;

      ////obj.dataSelected = this.selectedStation;
    }

    const dialogRef = this.popupService.open(SelectDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(async result => {

      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        //console.log(result.data);
        if (result.event == "Choix d'une station") {

          //this.selectedStation = result.data[0];

          this.selectedStation = this.secureCommonService.manageStationId('add', result.data[0]);

          let newurl = this.URL_add_parameter(location.href, 'stationId', this.selectedStation.id);
          window.history.pushState({ path: newurl }, '', newurl);
          this.loadRjv();
          this.getAllDate();
        }

      }
    });
    //}

  }

  private URL_add_parameter(url, param, value) {
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
      if (!parameters[i])
        continue;

      var ary = parameters[i].split('=');
      hash[ary[0]] = ary[1];
    }

    hash[param] = value;

    var list = [];
    Object.keys(hash).forEach(function (key) {
      list.push(key + '=' + hash[key]);
    });

    parser.search = '?' + list.join('&');
    return parser.href;
  }

  private URL_read_parameter(url, param) {
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
      if (!parameters[i])
        continue;

      var ary = parameters[i].split('=');
      hash[ary[0]] = ary[1];
    }

    return hash[param];
  }

  sumDataList(key, list = []) {
    if (list.length > 0) {
      const filtered_enll = list.filter((value, key) => {
        return true;
      });
      return filtered_enll.reduce((a, b) => a + (b[key] || 0), 0);
    }
  }

  dateClass() {
    return (cellDate: Date): MatCalendarCellCssClasses => {
      const date = new Date(cellDate);

      const day: number = date.getDate();
      const month: number = date.getMonth();
      const year: number = date.getFullYear();

      const dayIndex = this.sameMonthDatas?.filter((x) => {
        return x.day == day && x.month == (month + 1) && x.year == year;
      })[0];

      if (dayIndex != undefined && dayIndex != null) {
        //console.log(dayIndex, this.sameMonthDatas[dayIndex]);
        return 'highlight-date';
      } else {
        return '';
      }
    };
  }

  // dateClass1: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
  //   // Only highligh dates inside the month view.
  //   if (view === 'month') {
  //     const date = new Date(cellDate);
  //     const day: number = date.getDate();
  //     const dayIndex: number = this.sameMonthDatas.indexOf(day);
  //     if (dayIndex >= 0) {
  //       //console.log(dayIndex, this.sameMonthDatas[dayIndex]);
  //       return 'highlight-date';
  //     } else {
  //       return '';
  //     }
  //   }

  //   return '';
  // }

}
