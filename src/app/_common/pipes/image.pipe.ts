import { PipeTransform, Pipe } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EnvService } from '../../_services/common/env.service';

const API_URL = 'api/upload/';

@Pipe({ name: 'image' })
export class ImagePipe implements PipeTransform {
    defaultImage = 'assets/logo.png';

    constructor(
        private env: EnvService,
        private http: HttpClient,
    ) { }

    transform(_url: string) {

        if (_url != null && _url != '' && _url != undefined) {

            const _data = {
                url: _url
            };

            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json'
            });

            const url = this.env.API_URL + API_URL + 'link';

            return this.http.post<Blob>(url, _data, { headers, responseType: 'blob' as 'json' }) // specify that response should be treated as blob data
                .pipe(
                map(res => res),
                switchMap(blob => {
                    // return new observable which emits a base64 string when blob is converted to base64
                    return Observable.create(observer => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob); // convert blob to base64
                        reader.onloadend = function() {
                            // console.log(reader.result);
                            observer.next(reader.result); // emit the base64 string result
                        };
                    });
                }),
                // catchError(err => {
                //    //return this.defaultImage;
                //    return of(() => {
                //        return this.defaultImage;
                //    });
                // })
                    // map(res => res.body),// take the blob
                    // switchMap(blob => {
                    //    // return new observable which emits a base64 string when blob is converted to base64
                    //    return Observable.create(observer => {
                    //        const reader = new FileReader();
                    //        reader.readAsDataURL(blob); // convert blob to base64
                    //        reader.onloadend = function () {
                    //            observer.next(reader.result); // emit the base64 string result
                    //        }
                    //    })
                    // })
                );
        } else {
            //// return this.defaultImage;
            // return of(() => {
            //    return this.defaultImage;
            // });
        }

    }

}
