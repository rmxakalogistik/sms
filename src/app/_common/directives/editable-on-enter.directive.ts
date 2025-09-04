import { Directive, Input, HostListener } from '@angular/core';
import { EditableComponent } from '../templates/editable/editable.component';

@Directive({
  selector: '[editableOnEnter]'
})
export class EditableOnEnterDirective {
  constructor(private editable: EditableComponent) {
  }

  @HostListener('keyup.enter')
  onEnter() {
    this.editable.toViewMode();
  }

}
