import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../../_models/user';
import { AutorisationService } from '../../_services/autorisation.service';
import { AuthService } from '../../_services/common/auth.service';
import { first } from 'rxjs/operators';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
//import { AutorisationDialogComponent } from '../../_dialogs/autorisation-dialog/autorisation-dialog.component';
import { isNullOrUndefined } from 'util';
import { MenuBottomSheetComponent } from '../../_common/dialogs/menu-bottom-sheet/menu-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SignalrService } from '../../_services/common/signalr.service';
import { SignalRConnection } from 'ng2-signalr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SecureCommonService } from '../../_services/_secure-common.service';

@Component({
  selector: 'app-autorisations',
  templateUrl: './autorisations.component.html',
  styleUrls: ['./autorisations.component.scss']
})
export class AutorisationsComponent implements OnInit {
  autorisationsLoading = false;
  user: User;
  userId: string;
  editMode = false;
  _passedUser: any;
  autorisations: any = [];
  // userFromApi: User;
  autorisationDisplayedColumns: string[] = ['position', 'role', 'see', 'add', 'edit', 'delete', 'action'];
  private signalR_connection: SignalRConnection;
  signalR_connection_id: string;

  @ViewChild('autorisationstable', { static: true }) autorisationstable: MatTable<any>;

  constructor(
    private autorisationService: AutorisationService,
    public authService: AuthService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
    private signalrService: SignalrService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private secureCommonService: SecureCommonService,
  ) {
    this.user = this.authService.userValue;
    // this.autorisations = this.user.role;

    this.secureCommonService.datashare.subscribe(event => {
      if (!isNullOrUndefined(event)) {
        this.geteleme();
      }
    });

  }

  ngOnInit(): void {
    //// console.log(history.state.user);

    this.geteleme();


  }

  geteleme() {
    try {
      this._passedUser = this.secureCommonService.datashareValue?.user_autorisations;
    } catch {
      this._passedUser = null;
    }

    if (this._passedUser == null) {
      this.editMode = false;
    } else if (this._passedUser.id == this.user.id) {
      this.editMode = false;
    } else {
      this.editMode = this.authService.roleEXist('comptes_manage');
    }

    //// console.log(this._passedUser.id);
    //// console.log(this.user.id);
    this.userId = this._passedUser?.id || this.user.id;

    this.loadAutorisation();
  }


  ngOnDestroy(): void {
    // this.secureCommonService.ShareClear();
    // if (this.signalR_connection) {
    //  this.signalR_connection.stop();
    //  this.signalR_connection = null;
    // }
  }


  // ****AUTORISATION
  async loadAutorisation() {
    if (!this.autorisationsLoading) {
      this.autorisationsLoading = true;
      await this.autorisationService.getByUserId(this.userId).pipe(first()).subscribe(resp => {
        this.autorisationsLoading = false;
        this.autorisations = resp;
      },
        error => {
          if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
            error = 'Chargement des données impossible, veuillez réessayer.';
          }
          this._snackBar.open(error, null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
          });
          this.autorisationsLoading = false;
        });
    }
  }
  openAutorisationDialog(action, obj) {
    //obj.action = action;
    //const dialogRef = this.dialog.open(AutorisationDialogComponent, {
    //  maxWidth: '300px',
    //  data: obj
    //});

    //dialogRef.afterClosed().subscribe(result => {
    //  if (!isNullOrUndefined(result)) {
    //    if (result.event == 'Création') {
    //      this.addAutorisationRowData(result.data);
    //    } else if (result.event == 'Modification') {
    //      this.updateAutorisationRowData(result.data);
    //    } else if (result.event == 'Suppression') {
    //      this.deleteAutorisationRowData(result.data);
    //    }
    //  }
    //});
  }
  addAutorisationRowData(row_obj) {
    // var d = new Date();
    this.autorisations.push(row_obj);
    // this.autorisations.push({
    //  id: row_obj.id,
    //  role: row_obj.role,
    //  add: row_obj.add,
    //  edit: row_obj.edit,
    //  delete: row_obj.delete
    // });
    this.autorisationstable.renderRows();

  }
  updateAutorisationRowData(row_obj) {
    this.autorisations = this.autorisations.filter((value, key) => {
      if (value.idbdd == row_obj.idbdd) {
        value.id = row_obj.id;
        value.role = row_obj.role;
        value.see = row_obj.see;
        value.add = row_obj.add;
        value.edit = row_obj.edit;
        value.delete = row_obj.delete;
      }
      return true;
    });
  }
  deleteAutorisationRowData(row_obj) {
    this.autorisations = this.autorisations.filter((value, key) => {
      return value.idbdd != row_obj.idbdd;
    });
  }
  openAutorisationBottomSheet(element) {

    const _actions = [];
    // 'Modification',

    if (element.id !== 'sysadmin' && element.id !== 'autorisations_manage' && element.id !== 'comptes_manage' && this.authService.roleEXist('autorisations_manage').edit) {
      _actions.push({ text: 'Modification', icon: 'create' });
    }

    if (element.id !== 'sysadmin' && element.id !== 'autorisations_manage' && element.id !== 'comptes_manage' && this.authService.roleEXist('autorisations_manage').delete) {
      _actions.push({ text: 'Suppression', icon: 'delete' });
    }

    if (_actions.length > 0) {
      const bottomSheetRef = this._bottomSheet.open(MenuBottomSheetComponent, {
        data: {
          list: _actions,
          titre: element.role
        },
      });

      bottomSheetRef.afterDismissed().subscribe(bottomSheetresult => {
        const result = bottomSheetresult;
        if (!isNullOrUndefined(result)) {
          this.openAutorisationDialog(result.text, element);
        }
      });
    }
  }

  // ****END AUTORISATION

  async changeUserAutorisation(elem, isee= false) {
    //// console.log(elem);

    if (isee == false && elem.see != true && (elem.add == true || elem.edit == true || elem.delete == true)) {
      elem.see = true;
    }

    elem.error = '';
    await this.autorisationService.changeUserAutorisation(elem, this.userId).pipe(first()).subscribe(resp => {
      //// console.log(resp);
    },
      error => {
        if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
          error = 'Sauvegarde impossible, veuillez réessayer.';
        }

        elem.error = error;
        this._snackBar.open(error, null, {
          duration: 5000,
          verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
        });
        // this.autorisationsLoading = false;
      });
  }

  autorisationEXist(_short_name) {
    const _secure = this.router.config.find(x => x.path === 'sds-secure').children;
    const _who = _secure.find(x => x.path + '_manage' === _short_name);
    return _who;
  }



}
