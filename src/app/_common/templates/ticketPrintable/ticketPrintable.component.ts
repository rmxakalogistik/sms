import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { SecureCommonService } from 'src/app/_services/_secure-common.service';
import { EnvService } from 'src/app/_services/common/env.service';
import { AuthService } from 'src/app/_services/common/auth.service';
import { User } from 'src/app/_models/user';
import { isNullOrUndefined } from 'util';
const moment = _rollupMoment || _moment;
moment.locale('fr');

@Component({
  selector: 'app-ticketPrintable',
  templateUrl: './ticketPrintable.component.html',
  styleUrls: ['./ticketPrintable.component.scss']
})
export class TicketPrintableComponent implements OnInit {

  @Input() loading: boolean = false;
  @Input() dataToPrintPosTicket: any = null;
  @Input() qrcodevalue = null;

  // string
  defaultImage: string = './assets/img/logo.png';

  // any
  selectedStation: any;
  authImage;

  // object
  user: User;
  
  // others
  env: EnvService;

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

  @ViewChild('printRepportPosTicket') printRepportPosTicket: ElementRef;

  constructor(
    public authService: AuthService,
    private secureCommonService: SecureCommonService,
    private _env: EnvService,
    ) {
      this.env = _env;
      this.authImage=this.env.API_URL + "/assets/icons/icon-96x96.png";
  }

  ngOnInit(): void {
    this.user = this.authService.userValue;
    
    if(this.user.station){
      this.selectedStation = this.user.station;
    }else{
      console.log('CSUTOMERID: ' + this.URL_read_parameter(location.href, 'stationId'));
  
      let __thisUrl = this.URL_read_parameter(location.href, 'stationId');
      if (!isNullOrUndefined(__thisUrl)) {
        this.selectedStation = this.secureCommonService.manageStationId();
      } else {
        this.selectedStation = this.secureCommonService.manageStationId();//this.selectedStation = this.secureCommonService.manageStationId('clear');
      }
    }

  }

  sumDataList(key, list = []) {
    if (list.length > 0) {
      const filtered_enll = list.filter((value, key) => {
        return true;
      });
      return filtered_enll.reduce((a, b) => a + (b[key] || 0), 0);
    }
  }


  printTicket():any {

    return this.printRepportPosTicket.nativeElement.querySelector('#dataToPrint-div').innerHTML;
    
  }

  onImgError(event) {
    event.target.src = this.defaultImage;
  }


  private URL_read_parameter(url, param) {
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
      if (!parameters[i])
        continue;

      var ary = parameters[i].split('=');
      hash[ary[0]] = ary[1];
    }

    return hash[param];
  }

  
}
