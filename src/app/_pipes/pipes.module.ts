import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePipe } from './image.pipe';
import { NumberToWordsPipe } from './numberToWords.pipe';
import { MyFilterPipe } from './myFilterPipe';

@NgModule({
    imports: [
        CommonModule
    ],
  declarations: [ImagePipe, NumberToWordsPipe, MyFilterPipe],
  exports: [ImagePipe, NumberToWordsPipe, MyFilterPipe]
})
export class PipesModule { }
