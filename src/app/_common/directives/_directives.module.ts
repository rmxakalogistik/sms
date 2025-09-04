import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollDirective } from './scroll.directive';
import { AboutDirective } from './about.directive';
import { DiableAutofillDirective } from './appDisableAutofill.directive';
import { PaginatorDirective } from './paginator.directive';
import { FocusableDirective } from './focusable.directive';
import { EditModeDirective } from './edit-mode.directive';
import { EditableOnEnterDirective } from './editable-on-enter.directive';
import { ViewModeDirective } from './view-mode.directive';
import { FuseIfOnDomDirective } from './fuse-if-on-dom.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ScrollDirective,
    AboutDirective,
    DiableAutofillDirective,
    PaginatorDirective,
    FocusableDirective,
    EditModeDirective,
    EditableOnEnterDirective,
    ViewModeDirective,
    FuseIfOnDomDirective,
  ],
  exports: [
    ScrollDirective,
    AboutDirective,
    DiableAutofillDirective,
    PaginatorDirective,
    FocusableDirective,
    EditModeDirective,
    EditableOnEnterDirective,
    ViewModeDirective,
    FuseIfOnDomDirective,
  ]
})
export class DirectivesModule { }
