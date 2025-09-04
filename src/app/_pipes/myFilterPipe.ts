import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Pipe({
    name: 'myfilter',
    pure: false
})
export class MyFilterPipe implements PipeTransform {
    transform(items: any[], filter: string): any {
      if (!items || !filter || isNullOrUndefined(filter) || isNullOrUndefined(items)) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
      //console.log(filter);
      return items.filter(item => (JSON.stringify(item).toUpperCase()).indexOf(filter.toUpperCase()) !== -1);
    }
}
