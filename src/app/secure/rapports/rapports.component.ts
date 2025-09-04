import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { Rapport } from '../../_models/rapport';
import { startWith, switchMap, map, catchError, first } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SecureCommonService } from '../../_services/_secure-common.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { merge, of } from 'rxjs';
import { RapportService } from 'src/app/_services/common/rapport.service';
import { AuthService } from 'src/app/_services/common/auth.service';
import { PopupService } from 'src/app/_services/common/popup.service';
import { SelectDialogComponent } from 'src/app/_common/dialogs/select-dialog/select-dialog.component';
import { User } from 'src/app/_models/user';
import { DatePipe } from '@angular/common';
import { MenuBottomSheetComponent } from 'src/app/_common/dialogs/menu-bottom-sheet/menu-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';


@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RapportsComponent implements OnInit {

  //titres: any = [];
  //communes: any = [];
  //fosas: any = [];
  programmes: any = [];
  entrepots: any = [];
  tournees: any = [];
  canFilterTrajetListe: any = [];

  rapports: any = [];
  local_data: any = {};
  maxDate: Date;
  canFetch = false;
  isLoading = false;
  isPrint = false;
  matPanelExpanded = false;
  // object
  user: User;
  loggedUser: User;
  selectedStation: any;
  bottomSheetRef: any;
  fetchRequest: any = null;

  fabTogglerState: string = 'inactive';
  fabButtons: any = [];
  buttons: any = [];

  @ViewChild('printDevi', { static: false }) printDevi: ElementRef;
  @ViewChild('hheader', { static: true }) hheader: ElementRef;
  @ViewChild('ffooter', { static: true }) ffooter: ElementRef;


  alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


  constructor(
    private rapportService: RapportService,
    public authService: AuthService,
    private secureCommonService: SecureCommonService,
    private popupService: PopupService,
    private _snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
  ) {

    this.loggedUser = this.authService.userValue;
    this.user = this.authService.userValue;

    this.maxDate = new Date();
    this.local_data = {};
  }

  ngOnInit(): void {

    if (!isNullOrUndefined(this.user.station)) this.selectedStation = this.user.station;

    //this.local_data.date_debut = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    this.local_data.date_debut = this.maxDate;
    this.local_data.date_fin = this.maxDate;
    //this.local_data.filterTxt = 'TOUS';
    let dsfd: any = { title: 'TOUS' };
    this.local_data.filterTrajetDefault = dsfd;
    this.local_data.filterTrajet = dsfd;
    this.local_data.filterVol = 'TOUS';


    if (this.user.station) {
      this.selectedStation = this.user.station;
    } else {
      console.log('CSUTOMERID: ' + this.URL_read_parameter(location.href, 'stationId'));

      let __thisUrl = this.URL_read_parameter(location.href, 'stationId');
      if (!isNullOrUndefined(__thisUrl)) {
        this.selectedStation = this.secureCommonService.manageStationId();
        //this.selectionDialog('repportList');
      } else {
        this.selectedStation = this.secureCommonService.manageStationId();//this.selectedStation = this.secureCommonService.manageStationId('clear');
      }
    }
    if (isNullOrUndefined(this.selectedStation)) {
      this.selectionDialog('station', {});
    }

    this.fabButtons = [
      {
        id: 'list_alt',
        icon: 'list_alt',
        tooltip: 'LISTE DES RAPPORTS DISPONIBLES',
        color: 'primary'
      },
      {
        id: 'autorenew',
        icon: 'autorenew',
        tooltip: 'ACTUALISER',
        color: 'primary'
      }

    ];

    //this.loadRepportTitre();

    if (this.selectedStation) { this.selectionDialog('repportList'); }

  }

  ngOnDestroy(): void { }

  applyFilter() {

  }

  getLetter(index) {
    return this.alphabet[index];
  }


  changeDate(ousa) {
    let _newFin = new Date(this.local_data.date_fin);
    let _newDebut = new Date(this.local_data.date_debut);

    if (ousa == 2) {
      if (this.local_data.date_debut == null || this.local_data.date_debut == undefined || _newFin < _newDebut) {
        this.local_data.date_debut = new Date(this.local_data.date_fin).toJSON();
        _newDebut = new Date(this.local_data.date_fin);
      }
    } else if (ousa == 1) {
      if (this.local_data.date_fin == null || this.local_data.date_fin == undefined || _newDebut > _newFin) {
        this.local_data.date_fin = new Date(this.local_data.date_debut).toJSON();
        _newFin = new Date(this.local_data.date_debut);
      }
    }

    if (_newDebut <= _newFin) {
      this.canFetch = true;
      //this.loadRepportData();
      if (this.local_data.rapportTitre.canFilterTrajet) {
        this.getDateFIlter(_newDebut, _newFin);
      }
    } else {
      this.canFetch = false;
    }
  }

  async loadRepportData() {

    if (this.canFetch != true ||
      isNullOrUndefined(this.local_data.rapportTitre) ||
      isNullOrUndefined(this.local_data.date_debut) ||
      isNullOrUndefined(this.local_data.date_fin)) { return false; }

    setTimeout(() => {

      console.log(this.local_data.date_debut, this.local_data.date_fin);

      const _datedebut = new Date(this.local_data.date_debut);
      const _datefin = new Date(this.local_data.date_fin);

      const topost = {
        rapportTitre: this.local_data.rapportTitre,
        //filterTxt: this.local_data.filterTxt,
        filterTrajet: (this.local_data.filterTrajet ? this.local_data.filterTrajet.title : 'TOUT'),
        filterVol: this.local_data.filterVol,
        stationId: this.selectedStation.id,
        date_debut: new Date(_datedebut.getTime() - (_datedebut.getTimezoneOffset() * 60000)).toJSON(),
        date_fin: new Date(_datefin.getTime() - (_datefin.getTimezoneOffset() * 60000)).toJSON(),
      };

      merge(0)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoading = true;
            return this.rapportService!.getRaportData(topost);
          }),
          map(data => {
            console.log(data);
            return data.results;
          }),
          catchError((error) => {
            this.isLoading = false;
            this._snackBar.open(error, null, {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            return of([]);
          })
        ).subscribe(data => {
          this.isLoading = false;
          this.matPanelExpanded = false;
          this.rapports = data;

          if (this.local_data.rapportTitre && this.rapports[0]?.hasData) {
            let _dsdsd_file_download = this.fabButtons.filter((value, key) => {
              return value.id == 'print';
            })[0];
            if (isNullOrUndefined(_dsdsd_file_download)) {
              this.fabButtons.push({
                id: 'file_download',
                icon: 'file_download',
                tooltip: 'EXPORTER EN EXCEL',
                color: 'primary'
              });
            }
            let _dsdsd_print = this.fabButtons.filter((value, key) => {
              return value.id == 'print';
            })[0];
            if (isNullOrUndefined(_dsdsd_print)) {
              this.fabButtons.push({
                id: 'print',
                icon: 'print',
                tooltip: 'IMPRIMER',
                color: 'primary'
              });
            }
          }

        });

    });

  }

  getDateFIlter(date1, date2) {
    if (this.local_data && this.local_data.rapportTitre && this.local_data.rapportTitre.canFilterTrajet) {
      this.isLoading = true;

      if (this.fetchRequest) {
        this.fetchRequest.unsubscribe();
      }
      const _datedebut = new Date(this.local_data.date_debut);
      const _datefin = new Date(this.local_data.date_fin);

      const topost = {
        stationId: this.selectedStation.id,
        date_debut: new Date(_datedebut.getTime() - (_datedebut.getTimezoneOffset() * 60000)).toJSON(),
        date_fin: new Date(_datefin.getTime() - (_datefin.getTimezoneOffset() * 60000)).toJSON(),
      };
      this.fetchRequest = this.rapportService!.getAllFilterTrajetListe(topost).pipe(first()).subscribe(data => {
        this.isLoading = false;
        if (data.items) this.canFilterTrajetListe = data.items;
        this.loadRepportData();
      },
        error => {
          this.isLoading = false;
          this.canFilterTrajetListe = [];
        });

    } else {
      this.isLoading = false;
      this.canFilterTrajetListe = [];
    }

  }

  openBottomSheet(element) {
    console.log(element);
    const _actions = [];

    // if (this.authService.roleEXist('ventes_manage')?.add || this.authService.roleEXist('ventes_manage')?.edit) {
    //   //_actions.push({ text: 'Écritures comptable', icon: 'account_tree' });
    //   _actions.push({ text: 'Paiement', icon: 'attach_money' });
    // }

    // if (_actions.length > 0) {
     
    //   this.bottomSheetRef = this._bottomSheet.open(MenuBottomSheetComponent, {
    //     data: {
    //       list: _actions,
    //       titre: _element.shownumuniString
    //     },
    //   });

    //   this.bottomSheetRef.afterDismissed().subscribe(bottomSheetresult => {
    //     const result = bottomSheetresult;
    //     if (!isNullOrUndefined(result)) {
    //       if (result.text == "Paiement") {
    //         this.openVenteDialog(result.text, _element);
    //         //this.openEcritureManageDialog(result.text, element);
    //       }
    //     }
    //   });

    // }
  
  }

  sumFooterDataList() {
    //console.log(this.rapports);
    if (!isNullOrUndefined(this.rapports[0].footer)) {
      const filtered_enll = this.rapports[0].footer.filter((value, key) => {
        let ___jkjk: number = +value;
        //console.log(___jkjk, value);
        return ___jkjk > 0;
      })[0];
      return !isNullOrUndefined(filtered_enll);
    }
    return false;
  }

  isNumber(val): boolean { return typeof val === 'number'; }

  excelExcel(isPrint) {

    let self = this;

    let __finalTable: any[] = [];
    //let __header: any[] = ['origine', 'codepnam', 'nom', 'cond', 'forme', 'categorie', 'classe', 'programme', 'colonne1', 'souscategorie', 'conditionstockage', 'volume', 'poids'];
    let __llist: any[] = [];

    let dsds_yuyu: any[] = [];
    //for (const a in self.rapports[0].header) {
    for (let i = 0; i < self.rapports[0].header.length; i++) {
      let PropItem_ = self.rapports[0].header[i].text;
      dsds_yuyu.push(PropItem_);
    }
    __finalTable.push(dsds_yuyu);

    __llist.push(...self.rapports[0].list);
    __llist.forEach(function (RowItem, RowIndex) {
      let dsds: any[] = [];
      for (let i = 0; i < self.rapports[0].header.length; i++) {
        let PropItem = self.rapports[0].header[i].columnName;
        for (const ColItem in RowItem) {
          if (ColItem == PropItem) {
            let gfgf = ((RowItem[ColItem] + '').replace('<br />', ' ')).toString();
            dsds.push(gfgf);
          }
        }
      }

      __finalTable.push(dsds);

      if (!isNullOrUndefined(RowItem.details)) {

        RowItem.details.forEach(function (RowItem_, RowIndex_) {
          let dsds_: any[] = [];
          for (let j = 0; j < self.rapports[0].header.length; j++) {
            let PropItem = self.rapports[0].header[j].columnName;
            for (const ColItem_ in RowItem_) {
              if (ColItem_ == PropItem) {
                let gfgf_ = ((RowItem_[ColItem_] + '').replace('<br />', ' ')).toString();
                dsds_.push(gfgf_);
              }
            }
          }
          __finalTable.push(dsds_);

        });

      }

    });

    let downloadName = '';

    if (this.local_data.rapportTitre && this.local_data.rapportTitre.canDate && this.local_data.date_debut && this.local_data.date_fin) {

      const datePipe = new DatePipe('fr');
      const _dateDebut = datePipe.transform(this.local_data.date_debut, 'yyyyMMdd');
      const _dateFin = datePipe.transform(this.local_data.date_fin, 'yyyyMMdd');

      downloadName = '' + _dateDebut + '-' + _dateFin + '';
    }

    downloadName = downloadName + ', ' + this.selectedStation.title + ", " + this.local_data.rapportTitre.title;

    downloadName = ('' + downloadName).trim();

    console.log(downloadName);

    let dynamicTable = this.makeTableHTML(__finalTable);

    if (isPrint == true) {
      this.print(this.printDevi.nativeElement.innerHTML);
    } else {

      let tableToExcel = (function () {
        let uri = 'data:application/vnd.ms-excel;base64,';
        let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
        let base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); };
        let format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
        return function (table, name) {
          //if (!table.nodeType) table = document.getElementById(table);
          let ctx = { worksheet: name || 'Worksheet', table: table };
          let getlnk = uri + base64(format(template, ctx));

          var a = document.createElement('a');
          a.target = "_blank";
          a.download = name + ".xls";
          a.href = getlnk;
          a.click();

        };
      })();


      tableToExcel(dynamicTable, downloadName);

    }


  }

  makeTableHTML(myArray) {
    //console.log(myArray);
    let result = "<table border=1>";

    if (myArray[0] && myArray[0].length > 0) {
      if (this.selectedStation && this.selectedStation.title) {
        result += "<tr>";
        result += "<td colspan='" + myArray[0].length + "' style='text-align:center'>";
        result += this.selectedStation.title;
        result += "</td>";
        result += "</tr>";
      }

      if (this.local_data && this.local_data.rapportTitre && this.local_data.rapportTitre.title) {
        result += "<tr>";
        result += "<td colspan='" + myArray[0].length + "' style='text-align:center'>";
        result += this.local_data.rapportTitre.title;
        result += "</td>";
        result += "</tr>";
      }

      if (this.local_data.rapportTitre && this.local_data.rapportTitre.canDate && this.local_data.date_debut && this.local_data.date_fin) {

        const datePipe = new DatePipe('fr');
        const _dateDebut = datePipe.transform(this.local_data.date_debut, 'dd/MM/yyyy');
        const _dateFin = datePipe.transform(this.local_data.date_fin, 'dd/MM/yyyy');

        result += "<tr>";
        result += "<td colspan='" + myArray[0].length + "' style='text-align:center'>";
        result += _dateDebut + '-' + _dateFin;
        result += "</td>";
        result += "</tr>";
      }
    }

    for (let i = 0; i < myArray.length; i++) {
      result += "<tr class='myrrrow'>";
      for (let j = 0; j < myArray[i].length; j++) {
        result += "<td>" + ((myArray[i][j] == null || myArray[i][j] == 'null') ? '' : myArray[i][j]) + "</td>";
      }
      result += "</tr>";
    }
    result += "</table>";

    return result;
  }

  private async print(element) {
    if (!element) {
      return;
    }
    this.isLoading = true;

    setTimeout(() => {

      //element = element.replace('border=1','cellspacing=0 cellpadding=0');
      const _gyg = JSON.stringify(element);//border=1

      const popupWin = window.open('', '_blank', 'scrollbars=yes,height=700');

      const _gyg1 = (this.local_data.rapportTitre.canHeader == true) ? '<div class="header">' + this.hheader.nativeElement.innerHTML + '</div><div class="footer">' + this.ffooter.nativeElement.innerHTML + '</div>' : '';
      let styleNG = '.header, .header-space, .footer, .footer-space { height: 50px; width: 100%; } .header { position: fixed; top: 0; } .footer { position: fixed; bottom: 0; } @page { margin: 20mm } tr.myrrrow, tr.myrrrow td{border:1px solid #000000;} .noPrint{visibility:hidden}';
      let styleNG1 = '<table><thead><tr><td><div class="header-space" style="height: 60px;">&nbsp;</div></td></tr></thead><tbody><tr><td><div class="content" style="width:100%;">' + JSON.parse(_gyg) + '</div></td></tr></tbody><tfoot><tr><td><div class="footer-space">&nbsp;</div></td></tr></tfoot></table>' + _gyg1;
      popupWin.document.write('<!DOCTYPE html><html><head><style type="text/css">' + styleNG + '</style></head><body>' + styleNG1 + '</body></html>'); // vbssscript

      popupWin.document.close();
      popupWin.focus();
      popupWin.print();
      setTimeout(() => {
        //popupWin.close();
        this.isLoading = false;
      }, 3000);
    }, 3000);


  }

  async selectionDialog(action, obj: any = {}) {//index: number, 

    obj.actionId = action;

    if (action == 'station') {
      obj.action = "Choix du client";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;

      //obj.dataSelected = this.selectedStation;
    } else if (action == 'repportList') {
      obj.action = "Liste des rapports disponibles";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;

    }

    const dialogRef = this.popupService.open(SelectDialogComponent, '800px', {
      data: obj,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(async result => {
      //this.selectDialogAlreayOpen = false;

      if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
        console.log(result.data);
        if (result.event == "Choix du client") {

          //this.selectedStation = result.data[0];

          this.selectedStation = this.secureCommonService.manageStationId('add', result.data[0]);

          let newurl = this.URL_add_parameter(location.href, 'stationId', this.selectedStation.id);
          window.history.pushState({ path: newurl }, '', newurl);
          this.selectionDialog('repportList');

        } else if (result.event == "Liste des rapports disponibles") {
          console.log(result.data[0]);
          this.local_data.rapportTitre = result.data[0];
          this.changeDate(0);
          let dsfd: any = { title: 'TOUS' };
          this.local_data.filterTrajetDefault = dsfd;
          this.local_data.filterTrajet = dsfd;
          this.local_data.filterVol = 'TOUS';
          this.loadRepportData();
        }

      }
    });
    //}

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

  // ****FAB
  doFabAction(action) {
    if (action == 'autorenew') {
      this.loadRepportData();
    } else if (action == 'list_alt') {
      this.selectionDialog('repportList');
    } else if (action == 'print') {
      this.excelExcel(true);
    } else if (action == 'file_download') {
      this.excelExcel(false);
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


}
