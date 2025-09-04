import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { first, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNullOrUndefined } from 'util';
import { PopupService } from '../../../_services/common/popup.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { SE } from '../../directives/scroll.directive';
import { User } from '../../../_models/user';
import { AuthService } from '../../../_services/common/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qrcode-dialog',
  templateUrl: './qrcode-dialog.component.html',
  styleUrls: ['./qrcode-dialog.component.scss']
})
export class QrcodeDialogComponent implements OnInit, AfterContentInit {

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

  //QRCODE SCANNER
  
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrcodevalue = null;

  @ViewChild('zxingscanner', { static: false })
  scanner: ZXingScannerComponent;

  availableDevices: MediaDeviceInfo[];
  deviceCurrent: MediaDeviceInfo;
  deviceSelected: string;
  scannerEnabled = false;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  hasDevices: boolean;
  hasPermission: boolean;

  qrResultString: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;
  //**************

  constructor(
    public dialogRef: MatDialogRef<QrcodeDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    public dialog: MatDialog,
    public popupService: PopupService,
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

    this.qrcodevalue = null;
  }

  ngOnInit(): void {
    this.scannerEnabled = true;
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

  doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  ngAfterViewInit(): void {
    this.delayAndTryHarder();
  }

  scanSuccessHandler(a) {
    if (a) {
      this.doAction(a);
      //this.searchShownumuniData(a);
    }
  }

  cleardata() {
    this.qrcodevalue = null;
    this.scannerEnabled = true;
  }

  
  async delayAndTryHarder() {
    await this.delay(1000);
    this.toggleTryHarder();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const selectedStr = selected || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.deviceCurrent = device || undefined;
  }

  onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr = device?.deviceId || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  ngOnDestroy(): void {
    //this.subscription.unsubscribe();
  }


}
