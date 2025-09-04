import { FormControl } from '@angular/forms';

// @Injectable({
//    providedIn: 'root'
// })
export class UsernameValidator {

  static userService: any;
    static id = '';

  constructor(private _userService: any, _id) {
    UsernameValidator.userService = _userService;
    UsernameValidator.id = _id;
    }

    validUsername(fc: FormControl): any{
      const _valueUsername = (fc != undefined && fc.value != null) ? ('' + fc.value).toLowerCase() : '';
      if (UsernameValidator.userService != undefined && UsernameValidator.userService != null && _valueUsername != '') {
        const ____dataa = {
          id: UsernameValidator.id,
          emailOrPhone: ('' + fc.value).toLowerCase(),
        };
        return UsernameValidator.userService.checkName(____dataa)
                .then(data => data && data.available ? null : data)
          .catch(err => console.error(`ERROR-username.validator: ${err}`)) as any;
        } else {
            return null;
        }
  }
}
