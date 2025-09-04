import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBottomSheetModule, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatMenuModule} from '@angular/material/menu';
// import { MatMomentDateModule, MomentDateAdapter } from "@angular/material-moment-adapter";

@NgModule({

  imports: [MatButtonModule, MatCheckboxModule, MatCardModule, MatDividerModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatTooltipModule, MatTabsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatGridListModule, MatBottomSheetModule, MatSelectModule, MatStepperModule, 
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule, MatPaginatorModule, MatSortModule, 
    MatChipsModule, MatButtonToggleModule, MatSliderModule, MatMenuModule],
    exports: [MatButtonModule, MatCheckboxModule, MatCardModule, MatDividerModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatTooltipModule, MatTabsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule, 
    MatSnackBarModule, MatGridListModule, MatBottomSheetModule, MatSelectModule, MatStepperModule, 
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule, MatPaginatorModule, MatSortModule, 
    MatChipsModule, MatButtonToggleModule, MatSliderModule, MatMenuModule],
    providers: [
    { provide: MatBottomSheetRef, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} }
  ],
})
export class Material2Module { }
