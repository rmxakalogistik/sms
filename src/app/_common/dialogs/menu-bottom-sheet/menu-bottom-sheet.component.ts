import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-menu-bottom-sheet',
  templateUrl: './menu-bottom-sheet.component.html',
  styleUrls: ['./menu-bottom-sheet.component.scss']
})
export class MenuBottomSheetComponent implements OnInit {

  actions = [];
  titre;
  subtitre;

  constructor(private _bottomSheetRef: MatBottomSheetRef<MenuBottomSheetComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.actions = data.list;
    this.titre = data.titre;
    this.subtitre = data.subtitre;
  }

  ngOnInit(): void {
  }

  openLink(event: MouseEvent, action): void {
    this._bottomSheetRef.dismiss(action);
    event.preventDefault();
  }

}
