import { Component, OnInit } from '@angular/core';
import { EnvService } from '../../../_services/common/env.service';

@Component({
  selector: 'app-documentFooter',
  templateUrl: './documentFooter.component.html',
  styleUrls: ['./documentFooter.component.scss']
})
export class DocumentFooterComponent implements OnInit {


  constructor(
    public env: EnvService,
  ) {
  }


  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
