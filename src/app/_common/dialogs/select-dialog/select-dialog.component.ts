import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { first, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNullOrUndefined } from 'util';
import { PopupService } from '../../../_services/common/popup.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { SE } from '../../../_common/directives/scroll.directive';
import { User } from '../../../_models/user';
import { AuthService } from '../../../_services/common/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SelectionService } from '../../../_services/_selection.service';

@Component({
  selector: 'app-select-dialog',
  templateUrl: './select-dialog.component.html',
  styleUrls: ['./select-dialog.component.scss']
})
export class SelectDialogComponent implements OnInit, AfterContentInit {

  // boolean
  loading = false;
  editMode = false;
  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;
  isLoadingResults = false;

  // string
  action: string;
  userId: string;
  filterValue: string = '';
  titleToAffich: string = 'title';

  // any
  local_data: any;
  _passedUser: any;
  search_serviceSubject: any;
  dataSelectedCurrent: any;
  dataSelected: any;
  datas: any = { typeOfData: "stringArray", list: [] };

  // object
  user: User;

  // others
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  userSearchUpdate = new Subject<string>();
  @ViewChild('selectionList', { static: false }) selectionList: any;

  constructor(
    public dialogRef: MatDialogRef<SelectDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    public dialog: MatDialog,
    public popupService: PopupService,
    private selectionService: SelectionService,
    private _snackBar: MatSnackBar,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {

    this.user = this.authService.userValue;

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.titleToAffich = this.local_data.titleToAffich??'title';
    console.log(this.local_data);

  }

  ngOnInit(): void {
    this.userSearchUpdate.pipe(
      debounceTime(100),
      //distinctUntilChanged(),
    )
      .subscribe(value => {
        //console.log(this.datas);
        if (this.local_data.canSearchServer) {
          console.log(value);
          this.filterValue = (value) ? value : '';
          this.searchData(this.filterValue?.trim().toUpperCase());
        }
      });

      if (this.local_data.dataSelectedCurrent) this.dataSelectedCurrent = this.local_data.dataSelectedCurrent;
      if (this.local_data.preFill) {
      if (this.local_data.dataSelected) this.filterValue = (this.local_data.dataSelected.title ? this.local_data.dataSelected.title : this.local_data.dataSelected);
      this.searchData((this.local_data.canSearchServer && this.local_data.dataSelected) ? this.filterValue : '');
    }

  }

  ngAfterContentInit(): void {
  }

  public detectScroll(event: SE) {

    if (event.header) {
      this.isActive = false;
      this.isActivefadeInDown = true;
      this.fixedTolbar = true;
    }

    if (event.bottom) {
      this.isActive = true;
      this.isActivefadeInDown = false;
      this.fixedTolbar = false;
    }

  }

  close() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  canMoveNext(value): boolean {
    if (this.loading || isNullOrUndefined(this.selectionList)) {
      return false;
    }

    if (value == 'AJOUTER') {
      return this.local_data.canAdd && ((!isNullOrUndefined(this.selectionList.options) && this.selectionList.options?.length == 0) || isNullOrUndefined(this.selectionList.options));
    } else if (value == 'CHOISIR' && this.selectionList.selectedOptions) {
      return this.selectionList.selectedOptions.selected.length > 0;// this.dataSelected;
    } else {
      return false;
    }

  }

  doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  searchData(resp) {
    //if (!isNullOrUndefined(resp) && ('' + resp).length > 0) {

      this.loading = true;

      if (this.search_serviceSubject && !this.search_serviceSubject.closed) {
        this.search_serviceSubject.unsubscribe();
      }

      setTimeout(() => {

        if (this.search_serviceSubject && !this.search_serviceSubject.closed) {
          this.search_serviceSubject.unsubscribe();
        }

        let _topost: any = { ...this.local_data };
        _topost.textToFind = resp;

        //_topost = {
        //  actionId: this.local_data.actionId,
        //  stationId: this.local_data.stationId,
        //  : this.local_data.,
        //  textToFind: resp,
        //};

        this.search_serviceSubject = this.selectionService.getAll(_topost).pipe(first()).subscribe(response => {
          this.loading = false;
          this.datas = response;
          this.dataSelected = this.local_data.dataSelected;
        },
          error => {
            if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
              error = 'Impossible d\'effectuer cette action, veuillez réessayer.';
            }
            this._snackBar.open(error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false;
            this.datas = { typeOfData: "stringArray", list: [] };
          });
      }, 1500);


    //}
    //else {
    //  this.totalData = this.selectionList?.options?.length;
    //}
  }

}