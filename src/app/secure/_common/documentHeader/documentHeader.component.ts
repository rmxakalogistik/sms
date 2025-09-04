import { Component, OnInit } from '@angular/core';
import { EnvService } from '../../../_services/common/env.service';

@Component({
  selector: 'app-documentHeader',
  templateUrl: './documentHeader.component.html',
  styleUrls: ['./documentHeader.component.scss']
})
export class DocumentHeaderComponent implements OnInit {

  constructor(
    public env: EnvService,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
