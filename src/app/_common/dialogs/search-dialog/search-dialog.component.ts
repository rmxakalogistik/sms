import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopupService } from '../../../_services/common/popup.service';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss']
})
export class SearchDialogComponent implements OnInit {

  local_data: any;
  maxDate: Date;

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public popupService: PopupService) {
    this.maxDate = new Date();

    this.local_data = { ...data };

  }

  ngOnInit(): void {

  }

  close() {
    this.popupService.close();
  }

  confirm(resp) {
    this.dialogRef.close(resp);
  }

}
