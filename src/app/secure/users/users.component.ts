
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
// import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
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
import { UserDialogComponent } from '../../_dialogs/user-dialog/user-dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { User } from '../../_models/user';
import { UserAutorisationDialogComponent } from '../../_dialogs/user-autorisation-dialog/user-autorisation-dialog.component';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
const moment = _rollupMoment || _moment;
moment.locale('fr');


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersComponent implements OnInit {

  // boolean
  isLoadingResults = false;
  isRateLimitReached = false;

  // string
  filterValue: string;
  editedRowId: string = null;
  fabTogglerState: string = 'inactive';
  userDisplayedColumns: string[] = [ 'fonction','title','email','phone', 'station','gender','bithdate', 'action']; // ['position', 'nomComplet', 'userType', 'action'];

  // number
  resultsLength: number = 0;

  // any
  users: any = [];
  fabButtons: any = [];
  buttons: any = [];
  expandedElement: any;
  bottomSheetRef: any;

  // object
  user: User;

  // others
  private signalR_connection: SignalRConnection;

  // ViewChild
  @ViewChild('usertable', { static: true }) usertable: MatTable<any>;
  @ViewChild('myPaginator', { static: false }) paginator: MatPaginator;
  @ViewChild('inputUserSearch', { static: true }) inputUserSearch: ElementRef;


  constructor(
    private userService: UserService,
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
  ) {
    // this.introJsConfig();
  }

  ngOnInit(): void {

    this.user = this.authService.userValue;

    this.signalrService.notifConnexionChanged.subscribe((_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        const UserUpdatedlistener = this.signalR_connection.listenFor('newCompteUpdated');
        UserUpdatedlistener.subscribe(async (data: string) => {
          if(this.editedRowId != data){
            this.editedRowId = data;
              this.loadUser();
          }
        });

      }
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

    if (this.authService.roleEXist('comptes_manage').add) {
      this.fabButtons.push({
        id: 'add',
        icon: 'add',
        tooltip: 'AJOUTER',
        color: 'primary'
      });
    }


    this.loadUser();
    // this.introJS.start();
  }

  ngOnDestroy(): void { }

  applyFilter(valllue = null) {
    this.filterValue = (valllue) ? valllue : '';
    // this.usertable.dataSource.filter = filterValue.trim().toLowerCase();
    this.loadUser(this.filterValue?.trim().toUpperCase());
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  // ****STATION

  async loadUser(search = '') {
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
              return this.userService!.getAll(this.paginator.pageIndex, this.paginator.pageSize || 5, search);
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
          ).subscribe(data => this.users = data);
      }

    });

  }
  openUserDialog(action, obj) {
    obj.action = action;

    const dialogRef = this.popupService.open(UserDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
        if (result.event == 'Création') {
          this.addUserRowData(result.data);
        } else if (result.event == 'Modification') {
          this.updateUserRowData(result.data);
        } else if (result.event == 'Suppression') {
          this.deleteUserRowData(result.data);
        }
      }
    });
  }
  addUserRowData(row_obj) {
    //// console.log(row_obj);
    // var d = new Date();
    const hjj = this.users.filter((value, key) => {
      return value.id == row_obj.id;
    })[0];
    if (isNullOrUndefined(hjj)) {
      this.users.splice(0, 0, row_obj);
    }
    this.usertable.renderRows();

  }
  updateUserRowData(row_obj) {
    this.users = this.users.filter((value, key) => {
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
  deleteUserRowData(row_obj) {
    this.users = this.users.filter((value, key) => {
      return value.id != row_obj.id;
    });
  }
  openUserBottomSheet(element) {

    const _actions = [];
    // 'Modification',


    //_actions.push({ text: "Ajouter vignette", icon: 'add', data: element });

    if (element.id !== this.user.id && this.authService.roleEXist('autorisations_manage').edit) {
      _actions.push({ text: 'Autorisations', icon: 'rule', user: element });
    }

    //if (element.hasVignette == true) _actions.push({ text: 'Liste des vignettes', icon: 'list', data: element });

    //if (this.authService.roleEXist('comptes_manage')?.edit) {
    //  _actions.push({ text: 'Utilisateurs', icon: 'people', user: element });
    //}

    if (this.authService.roleEXist('comptes_manage')?.edit) {
      _actions.push({ text: 'Modification', icon: 'create' });
    }

    if (element.id !== this.user.id && this.authService.roleEXist('comptes_manage')?.delete) {
      _actions.push({ text: 'Suppression', icon: 'delete' });
    }

    if (_actions.length > 0) {
      this.bottomSheetRef = this._bottomSheet.open(MenuBottomSheetComponent, {
        data: {
          list: _actions,
          titre: element.nom
        },
      });

      this.bottomSheetRef.afterDismissed().subscribe(bottomSheetresult => {
        const result = bottomSheetresult;
        if (!isNullOrUndefined(result)) {
          //if (result.text == "Liste des vignettes") {
          //    this.secureCommonService.Sharevignette_user(result.data);
          //    this.router.navigate(['/sds-secure/vignettes'], { queryParams: { user: result.data.id }, state: { user: result.data } });
          //}
          if (result.text == "Autorisations") {
            this.openUserAutorisationDialog(result.text, element);
          }
          else {
            this.openUserDialog(result.text, element);
          }
        }
      });
    }
  }


  openUserAutorisationDialog(action, obj) {
    obj.action = action;

    const dialogRef = this.popupService.open(UserAutorisationDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
        if (result.event == 'Création') {
          this.addUserRowData(result.data);
        } else if (result.event == 'Modification') {
          this.updateUserRowData(result.data);
        } else if (result.event == 'Suppression') {
          this.deleteUserRowData(result.data);
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

  // ****FAB
  doFabAction(action) {
    if (action == 'add') {
      this.openUserDialog('Création', { isActive: true });
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