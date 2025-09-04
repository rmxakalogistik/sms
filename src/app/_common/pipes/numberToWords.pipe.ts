import { PipeTransform, Pipe } from '@angular/core';
import * as toWords from 'number-localization';

@Pipe({ name: 'numberToWords' })
export class NumberToWordsPipe implements PipeTransform {

    transform(s: any, args?: any): any {
        if (s) {
          return toWords(s, 'fr') as any;

        } else {
            return '';
        }
    }

}
