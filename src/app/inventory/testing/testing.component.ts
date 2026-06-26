import { Component, OnInit } from '@angular/core';
import { error } from 'console';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from "../../config/global";

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.sass']
})
export class TestingComponent implements OnInit {


  MyValue: any
  constructor(
    private gsxService: GsxService
  ) { }

  ngOnInit(): void {
  }


  getRepairDetails() {

    let searchData = { "repairId": this.MyValue };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = 'OMR2'
    var CompanyCode = glob.getCompanyCode()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("Repair Object GSX")

          if ((response.errors == undefined || response.errors == null)) {
            console.log('Response from test', response)
          }
          else {
            console.log('err', response.error)
          }

        }
      });

  }


}
