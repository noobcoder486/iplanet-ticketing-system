import { Component,EventEmitter, OnInit, Input,Output, SimpleChanges } from '@angular/core';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import xml2js from 'xml2js';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.component.html',
  styleUrls: ['./diagnostic.component.css']
})
export class DiagnosticComponent implements OnInit {
  DiagnosticURL
  DiagnosticData: any[] = []
  sowBar:any;

  @Output() CancelBtn =new EventEmitter<any>();
 
  typeSelected = 'ball-clip-rotate';

  @Input() ProductData
  @Output() close = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void{
    if(changes['ProductData'])
    {
      this.fetch_DiagnosisSuit()
    }
  }

  constructor(
    private ngxSpinner: NgxSpinnerService,
    private gsxService : GsxService,
  ) { }

  ngOnInit(): void {
  }

  closed:boolean;
  isdiagnosticPopClose(){
    this.closed=false;
    this.CancelBtn.emit(this.closed)
  }

  closeEvent()
  {
    this.close.emit();
  }

  fetch_DignosticsRunStatus()
  {
    setTimeout(() => {
      this.fetch_DignosticsRunStatus();
      
    }, 5000);
    this.fetch_DiagnosisStatus();
  }
  fetch_DiagnosisSuit() {
    let searchData = {"deviceId": this.ProductData.SerialNo}
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinner.show()
    this.gsxService.fetchDiagnosisSuit(contentRequest).subscribe(
      {
        next: (value) => {
           
          this.ngxSpinner.hide()
          let Data
          Data = JSON.parse(value.toString());
          this.DiagnosticURL= Data.diagnosticConsoleUrl
          this.DiagnosticData = Data.suiteDetails
        },
        error(err) {
          this.ngxSpinner.hide()
        }
        
      });
  }

  fetch_DiagnosisLookup() {

    var data =  {
      "device": {
        "id": this.ProductData.SerialNo
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
          
        },
        error(err) {
          this.ngxSpinner.hide()
        }
        
      });
  }


itemData
  run_Diagnostics(item)
  {
    this.sowBar=item;
    alert( this.sowBar)
this.itemData = item
   var data =  {
      "diagnostics": {
        "suiteId": item.suiteId
      },
      "device": {
        "id": this.ProductData.SerialNo
      }
    }
    let strRequestData = JSON.stringify(data);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.InitiateDiagnostics(contentRequest).subscribe(
      {
        next: (value) => {
           
          let Data
          Data = JSON.parse(value.toString());
          
          if(Data.diagnosticsInitiated == true)
          {
            this.fetch_DiagnosisStatus()
          }

        }
      });
    

  }
  generateDiagnosticXml() {
     ;
    let rawData = {
      "rows": []
    }
    for (let item of this.DiagnosticData) {
      rawData.rows.push({
        "row": {
          "SuiteId": item.suiteId,
          "SuiteName": item.suiteName,
          "TimeEstimateMaximum":item.timeEstimate.maximum,
          "TimeEstimateMinimum":item.timeEstimate.minimum,
        }
      })
    }
    console.log("rawData", rawData);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    console.log("xml", xml);
    return xml;
  }

  fetch_DiagnosisStatus() {
    let searchData = {"device": {"id":this.ProductData.SerialNo}}
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.fetchDiagnosisStatus(contentRequest).subscribe(
      {
        next: (value) => {
           
          let Data
          Data = JSON.parse(value.toString());

          if(Data.diagnosticSuite.suiteStatus == 'NO_TEST_IN_PROGRESS'){
            console.log("No Test Running")
          }else{
            do {
              this.run_Diagnostics(this.itemData)
            } while (Data.diagnosticSuite.percentComplete <= 100);
          }

          for(let item of this.DiagnosticData)
          {
            if(item.suiteId==Data.diagnosticSuite.id)
            {
              item.testStatus=Data
            }
          }

        }
      });
  }
}
