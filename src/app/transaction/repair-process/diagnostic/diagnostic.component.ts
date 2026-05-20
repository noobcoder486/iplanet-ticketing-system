import { Component, OnInit, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { CaseDetail } from '../repair-process.metadata';


@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.component.html',
  styleUrls: ['./diagnostic.component.css']
})
export class DiagnosticComponent implements OnInit {

  diagnosticData: any[] = []
  @Input() repa:CaseDetail;

  constructor(
    private gsxService: GsxService,
    private ngxSpinner: NgxSpinnerService

  ) { }

  ngOnInit(): void {
    this.fetch_DiagnosisLookup()
  }

  fetch_DiagnosisLookup() {

    var data =  {
      "maximumDiagsReturned":15,
      "detailedResultsRequested": false,
      "device": {
        "id": this.repa.SerialNo1
      }
    }  
    
    let strRequestData = JSON.stringify(data);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinner.show()
    this.gsxService.fetchDiagnosisLookup(contentRequest).subscribe(
      {
        next: (value) => {
           
          this.ngxSpinner.hide()
          let Data
          Data = JSON.parse(value.toString());

          this.diagnosticData = Data.diagnostics
          
        },
        error(err) {
          this.ngxSpinner.hide()
        }
        
      });
  }


}
