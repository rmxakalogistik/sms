import { Component, OnInit, ViewChild, ElementRef, Optional, Inject, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { SecureCommonService } from '../../../_services/_secure-common.service';
import { isNullOrUndefined } from 'util';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SE } from '../../../_common/directives/scroll.directive';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from 'src/app/_services/common/auth.service';
import { PopupService } from 'src/app/_services/common/popup.service';


@Component({
  selector: 'app-previewer',
  templateUrl: './previewer.component.html',
  styleUrls: ['./previewer.component.scss']
})
export class PreviewerComponent implements OnInit {
  loading = false;
  local_data: any;

  @ViewChild('printDevi', { static: true }) printDevi: ElementRef;

  @ViewChild('hheader', { static: true }) hheader: ElementRef;
  @ViewChild('ffooter', { static: true }) ffooter: ElementRef;

  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public dialogRef: MatDialogRef<PreviewerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    private route: ActivatedRoute,
    private secureCommonService: SecureCommonService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public popupService: PopupService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher  
  ) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    //// console.log(data);
    this.local_data = { ...data };
    console.log('RAMY', this.local_data);

    //this.secureCommonService.datashare.subscribe(event => {
    //  if (!isNullOrUndefined(event)) {
    //    this.geteleme();
    //  }
    //});


  }

  ngOnInit(): void {
    this.printDevi.nativeElement.innerHTML = this.local_data.html;
   // this.geteleme();
  }

  //geteleme() {
  //  try {
  //    this._passedtoPrint = this.secureCommonService.datashareValue?.preview; // JSON.parse(window.history.state.toPrint); //JSON.parse(this.route.snapshot.queryParams['toPrint']);//
  //    this.printDevi.nativeElement.innerHTML = this._passedtoPrint.childNode;
  //  } catch {
  //    this._passedtoPrint = null;
  //  }
  //}

  close() {
    this.dialogRef.close({ event: 'Cancel' });
    //this.popupService.close();
  }


  async print() {
    if (this.local_data) {
      this.loading = true;

      const dataToPost = {
        toPrint: this.local_data.html
      };

      setTimeout(() => {
        const element = dataToPost.toPrint;
        if (!element) {
          return;
        }

        const _gyg = JSON.stringify(element); // .innerHTML);
        
        // console.log(_gyg);
        const popupWin = window.open('', '_blank', 'scrollbars=yes,height=700');

        // let printPageHtml = '';
        // printPageHtml += '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Security-Policy"" content="default-src *; img-src \'self\'  data: http: https:;script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' *; style-src  \'self\' \'unsafe-inline\' *"><style type="text/css">html, body {width:';
        // printPageHtml += '';


        if (this.local_data.isTicket == true) {
          popupWin.document.write('<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src *; img-src \'self\'  data: http: https:;script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' *; style-src  \'self\' \'unsafe-inline\' *"><style type="text/css">html, body {width:50mm;margin:0;padding:0}table {padding: 0;border-collapse: collapse;}table th, table td { padding: 10px; font-size: 20px;}table.mmjkjk th, table.mmjkjk td {border: 0.2px solid #7c7c7c; }.page-header, .page-header-space { height: 50px; }.page-footer, .page-footer-space {height: 50px;}.page-footer {position: fixed; bottom: 0; width: 100%; border-top: 1px solid black;}.page-header {position: fixed;top: 0;width: 100%;}.page {page-break-after: always;}@page {margin: 0}@media print {thead {display: table-header-group;}tfoot {display: table-footer-group;}button {display: none;}body {margin: 0;}.no-print, .no-print *{display: none !important;}}</style></head><body>' + JSON.parse(_gyg) + '</body></html>'); // vbssscript
        } else {
          //const _gyg1 = (this.local_data.isHeader == true || this.local_data.isTicket == false) ? '<div class="page-header" style="text-align: center; background-color:#ffffff;width:100%;">' + this.hheader.nativeElement.innerHTML + '</div><div class="page-footer" style="text-align: center; background-color:#ffffff;width:100%;">' + this.ffooter.nativeElement.innerHTML + '</div>' : '';
          //popupWin.document.write('<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src *; img-src \'self\'  data: http: https:;script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' *; style-src  \'self\' \'unsafe-inline\' *"><style type="text/css">html, body {width:210mm;}table {padding: 0;border-collapse: collapse;}table th, table td { padding: 10px; font-size: 20px;}table.mmjkjk th, table.mmjkjk td {border: 0.2px solid #7c7c7c; }.page-header, .page-header-space { height: 50px; }.page-footer, .page-footer-space {height: 50px;}.page-footer {position: fixed; bottom: 0; width: 100%; border-top: 1px solid black;}.page-header {position: fixed;top: 0mm;width: 100%;}.page {page-break-after: always;padding:200px 0}@page {margin: 20mm}@media print {thead {display: table-header-group;}tfoot {display: table-footer-group;}button {display: none;}body {margin: 0;}.no-print, .no-print *{display: none !important;}}</style></head><body>' + JSON.parse(_gyg) + _gyg1 + '</body></html>'); // vbssscript
          
          const _gyg1 = (this.local_data.isHeader == true) ? '<div class="header">' + this.hheader.nativeElement.innerHTML + '</div><div class="footer">' + this.ffooter.nativeElement.innerHTML + '</div>' : '';
          let styleNG='.header, .header-space, .footer, .footer-space { height: 50px; width: 100%; } .header { position: fixed; top: 0; } .footer { position: fixed; bottom: 0; } @page { margin: 10mm }';
          let styleNG1='<table><thead><tr><td><div class="header-space">&nbsp;</div></td></tr></thead><tbody><tr><td><div class="content" style="width:100%;">' + JSON.parse(_gyg) + '</div></td></tr></tbody><tfoot><tr><td><div class="footer-space">&nbsp;</div></td></tr></tfoot></table>'+ _gyg1;
          popupWin.document.write('<!DOCTYPE html><html><head><style type="text/css">' + styleNG + '</style></head><body>' + styleNG1 + '</body></html>'); // vbssscript
        
        }

        // this.demande_to_print = null;print

        popupWin.document.close();
        popupWin.focus();
        popupWin.print();
        setTimeout(() => {
          //popupWin.close();
          this.loading = false;
        },3000);
      }, 3000);

    }
  }


  async sendEmail() {
    //if (this._passedtoPrint) {
    //  this.loading = true;
    //  const _gyg1 = '<div class="page-header" style="text-align: center; background-color:#ffffff;width:100%;">' + this.hheader.nativeElement.innerHTML + '</div><div class="page-footer" style="text-align: center; background-color:#ffffff;width:100%;">' + this.ffooter.nativeElement.innerHTML + '</div>';

    //  const dataToPost = {
    //    toPrint: this._passedtoPrint.childNode + _gyg1,
    //    subject: this._passedtoPrint.subject,
    //    body: this._passedtoPrint.body + '<br /><br />' + this._passedtoPrint.childNode + _gyg1,
    //    docName: this._passedtoPrint.docName,
    //    to: this._passedtoPrint.to,
    //    orientation: this._passedtoPrint.orientation,
    //  };

    // // var formData = this.captureScreen();

    //  await this.secureCommonService.SendPdf(dataToPost).pipe(first()).subscribe(resp => {
    //    this.loading = false;
    //    this._snackBar.open(resp, null, {
    //      duration: 5000,
    //    });
    //  },
    //    error => {
    //      if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
    //        error = 'Chargement des données impossible, veuillez réessayer.';
    //      }
    //      this._snackBar.open(error, null, {
    //        duration: 5000,
    //        verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
    //      });
    //      this.loading = false;
    //    });
    //}
  }

  // captureScreen(): any {
  //  var data = document.getElementById('contentToConvert');
  //  html2canvas(data).then(canvas => {
  //    // Few necessary setting options
  //    var imgWidth = 208;
  //    var pageHeight = 295;
  //    var imgHeight = canvas.height * imgWidth / canvas.width;
  //    var heightLeft = imgHeight;

  //    const contentDataURL = canvas.toDataURL('image/png');
  //    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
  //    var position = 0;
  //    pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
  //    //pdf.save(this._passedtoPrint.docName + '.pdf'); // Generated PDF

  //    var pdfData = pdf.output(); //returns raw body of resulting PDF returned as a string as per the plugin documentation.
  //    var formData = new FormData();
  //    formData.append("file", pdfData);
  //    return formData;
  //  });
  // }

  ngOnDestroy(): void {
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


}
