import { Injectable, TemplateRef } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private dialog: MatDialog, private breakpointObserver: BreakpointObserver) { }

  lis_matDialogRef: any = [];
  lis_smallDialogSubscription: Subscription[] = [];

  open(componentOrTemplateRef: ComponentType<any> | TemplateRef<any>, mobileWidth: string, data?: MatDialogConfig, isFull: boolean = true): MatDialogRef<any> {
    if (data) {
      data.maxWidth = '100vw';
      data.maxHeight = '100vh';
    }

    let matDialogRef = this.dialog.open(componentOrTemplateRef, data);

    let smallDialogSubscription = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(size => {
        if (size.matches) {
          matDialogRef.updateSize('100%', '100%');
        } else {
          if (isFull == true) {
            matDialogRef.updateSize('100%', '100%');
          } else {
            matDialogRef.updateSize(mobileWidth, 'auto');
          }
        }
      });
    this.lis_matDialogRef.push(matDialogRef);
    this.lis_smallDialogSubscription.push(smallDialogSubscription);
    return matDialogRef;
  }

  close(): void {
    if (this.lis_smallDialogSubscription) {
      for (let x = 0; x < this.lis_smallDialogSubscription.length; x++) {
        //this.smallDialogSubscription.unsubscribe();
        this.lis_smallDialogSubscription[x].unsubscribe();
      }
    }
    if (this.lis_matDialogRef) {
      for (let x = 0; x < this.lis_matDialogRef.length; x++) {
        //this.matDialogRef.close();
        this.lis_matDialogRef[x].close();
      }
    }

  }

}
