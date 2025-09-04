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
import { LoadedImage, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-img-cropper-dialog',
  templateUrl: './img-cropper-dialog.component.html',
  styleUrls: ['./img-cropper-dialog.component.scss']
})
export class ImgCropperDialogComponent implements OnInit, AfterContentInit {

  // boolean
  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;

  // any
  //imageChangedEvent: any = '';
  croppedImage: any = '';
  local_data: any;
  _passedUser: any;

  // others
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public dialogRef: MatDialogRef<ImgCropperDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    public dialog: MatDialog,
    public popupService: PopupService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.local_data = { ...data };
    console.log(this.local_data);
  }

  ngOnInit(): void {
    //this.fileChangeEvent(this.local_data);
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
    return this.croppedImage;
  }

  doAction(resp) {
    this.dialogRef.close({ data: resp });
  }

  //fileChangeEvent(event: any): void {
  //  this.imageChangedEvent = event;
  //}
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    //console.log(this.croppedImage);
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

}
