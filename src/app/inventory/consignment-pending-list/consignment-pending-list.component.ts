import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
// import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core'; // or MatMomentDateModule
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-consignment-pending-list',
  templateUrl: './consignment-pending-list.component.html',
  styleUrls: ['./consignment-pending-list.component.css']
})
export class ConsignmentPendingListComponent implements OnInit {

  
  constructor(
    private route: Router,
    private gsxService: GsxService,
    private dropdownDataService: DropdownDataService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private dynamicService: DynamicService,
    private datePipe: DatePipe,
    private reportService : ReportService,
    private toastr: ToastrService,

  ) {

  }
  
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  SelectedLocation: any
  Ship_to_GSX: string;
  pendingAcknowlegdeList: any[] = [];
  NotFoundLocations: any[] = [];
  IsAllLocationSelected: boolean = false;
  NotFoundLocationsString: any;
  isShowSaveButton: boolean = false;
  isUpdateDate :boolean =false;
  // For updating the Locked Date
  CurrentLockedDate:any;
  CurrentDeliveryDate:any;
  CurrentDeliveryCode:any;
  CurrentLocationCode:any
  UpdatedLockDate: Date | null = null;

  Remark:any;

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.getConsignmentPendingList()
  }
  Add(){
 this.route.navigate(['auth/' + glob.getCompanyCode() + '/add-consignment-pending-list'])
  }
   UpdateLockDate(item){
    
    
      this.isUpdateDate =true
      this.CurrentDeliveryCode=item.DeliveryCode
       this.CurrentLockedDate=item.LockDate;
       this.CurrentDeliveryDate=item.DeliveryDate;
       this.CurrentLocationCode=item.LocationCode;
       
   }
closepop(){
  this.isUpdateDate =false;
       this.CurrentDeliveryCode=null
       this.CurrentLockedDate=null
       this.CurrentDeliveryDate=null
       this.CurrentLocationCode = null
       this.UpdatedLockDate = null
}
  getConsignmentPendingList() {

    
     this.pendingAcknowlegdeList=[];
    this.ngxSpinnerService.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "ConsignmentPendingList"
    });
    requestData.push({
      "Key": "DeliveryCode",
      "Value":''
    });

    requestData.push({
      "Key": "StatusCode",
      "Value": ''
    });
    requestData.push({
      "Key": "Ship_To_GSX",
      "Value": ''
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.SelectedLocation == null || this.SelectedLocation == undefined ? '' : this.SelectedLocation 
    });
   
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": ""
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {

       next: (Value) => {
          try {
             
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
             
              let data = JSON.parse(response.ExtraData);
              if (Array.isArray(data.ConsignmentList.ConsignmentRow)) {
               
                this.pendingAcknowlegdeList = data.ConsignmentList.ConsignmentRow;
                   this.ngxSpinnerService.hide();
                   console.log('this.pendingAcknowlegdeList' , this.pendingAcknowlegdeList);
              }
              else {
                this.pendingAcknowlegdeList.push(data.ConsignmentList.ConsignmentRow)
             
                   console.log('this.pendingAcknowlegdeList' , this.pendingAcknowlegdeList);

                 this.ngxSpinnerService.hide();
              }

            }
          } catch (ext) {
             this.ngxSpinnerService.hide();
          }
        },
        error: err => {
           this.ngxSpinnerService.hide();
        }

      }
    );
  }




 


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]

          this.LocationForJob = value;
          console.log('this.LocationForJob', this.LocationForJob);
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

// update lockdate for deliverycode 

 UpdateConsignmentPendingHeaderLockDate() {
    
    if (this.UpdatedLockDate == null || this.UpdatedLockDate == undefined) {
      this.toast.error('Updated Lock Date Cannot be empty');
      return
    }
    const presentDate = new Date();
    const formattedpresentDate = this.datePipe.transform(presentDate, 'yyyy-MM-dd');
    const UpdatedLockDateformatted = this.datePipe.transform(this.UpdatedLockDate, 'yyyy-MM-dd');
    if (UpdatedLockDateformatted < formattedpresentDate) {
      this.toast.error('Updated Lock Date Cannot be past Date!');
      return
    }

    if (this.CurrentDeliveryCode == null || this.CurrentDeliveryCode == undefined || this.CurrentDeliveryCode == ' ') {
      this.toast.error('Delivery Code Cannot be empty');
      return
    }
    if (this.CurrentLocationCode == null || this.CurrentLocationCode == undefined || this.CurrentLocationCode == ' ') {
      this.toast.error(' Location  Code Cannot be empty');
      return
    }

    this.ngxSpinnerService.show()

    let requestData = [];
    
    requestData.push({
      "Key": "ApiType",
      "Value": "ConsignmentPendingHeaderLockDate"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.CurrentLocationCode
    });
    requestData.push({
      "Key": "DeliveryCode",
      "Value": this.CurrentDeliveryCode
    });
    requestData.push({
      "Key": "UpdatedDate",
      "Value": UpdatedLockDateformatted
    });
    requestData.push({
      "Key": "DeliveryDate",
      "Value": this.CurrentDeliveryDate
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.Remark
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log('contentRequest', contentRequest);
    const alertResponse = confirm('Are you Sure? want to Continue ?');
    if (!alertResponse) {
      return
    }

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toast.success("Updated  Successfully");
            window.location.reload();

          }
          else {
            this.toast.error("Error While Saving !")
            window.location.reload();
          }
        },
        error: err => {

          this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          this.toast.error("Error While Saving !", err)

          const errors = err.split("Error Code:").slice(1);
        }
      });

  }

  ExportConsignmentPendingList() {

    const PresentDate =  new Date();
     const formattedpresentDate = this.datePipe.transform(PresentDate, 'yyyy-MM-dd');

      let requestData = []
     
      requestData.push({
        "Key": "APIType",
        "Value": "ExportConsignmentPendingList"
      })
      requestData.push({
        "Key": "LocationCode",
        "Value": this.SelectedLocation == null || this.SelectedLocation == undefined ? '' : this.SelectedLocation
      })        
      console.log('data1', requestData)
      let strRequestData = JSON.stringify(requestData);
      let contentRequest =
      {
        "content": strRequestData
      };
      console.log('data', contentRequest)
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
        {
          next: (Value) => {
            
            // this.ngxSpinnerService.hide()
            try {
              let response = JSON.parse(Value.toString());
              const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
              var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
              // Create a download link
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.href = url;
              const fileName = `consignment-pending-list_${formattedpresentDate}.xls`;
              link.download = fileName;
              link.click();      
              URL.revokeObjectURL(url);
              // this.ngxSpinnerService.hide();

            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
          }
        }
      );
 
 }


  // pendingAcknowlegdeListIntoXML(){
  //     let rawData = {
  //       "rows": []
  //     }
  //     for (let item of this.pendingAcknowlegdeList) {
  //       rawData.rows.push({
  //         "row": {
  //           "ConsignmentPendingHeaderGUID":  uuidv4(),
  //           "DeliveryNumber" : item.deliveryNumber,
  //           "DeliveredDate"  : item.deliveredDate,
  //           "StatusCode" : item.statusCode,
  //           "StatusDescription": item.statusDescription,
  //           "Ship_to_GSX" : '0000000000',
  //         }
  //       })
  //     }
  //     var builder = new xml2js.Builder();
  //     var xml = builder.buildObject(rawData);
  //     xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //     xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //     console.log("Part XML:- ",xml);
  //     return xml;
  //   }

  // pendingAcknowlegdeListIntoXML() {
  //   let rawData = {
  //     "rows": {
  //       "row": this.pendingAcknowlegdeList.map(item => ({
  //         "ConsignmentPendingHeaderGUID": uuidv4(),
  //         "DeliveryCode": item.deliveryNumber,
  //         "DeliveryDate": item.deliveredDate,
  //         "StatusCode": item.statusCode,
  //         "StatusDescription": item.statusDescription,
  //         "Ship_to_GSX": item.Ship_to_GSX,
  //         "LocationCode": item.LocationCode,
  //         "IsLocked": 0
  //       }))
  //     }
  //   };

  //   const builder = new xml2js.Builder({
  //     headless: true,
  //     renderOpts: { pretty: false }
  //   });
  //   let xml = builder.buildObject(rawData);
  //   xml = xml.replace(/<\/row>/g, '</row>\n');
  //   console.log("Part XML:- ", xml);
  //   return xml;
  // }

  onKeyPress(event: KeyboardEvent, validationType: string, field: string) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const inputFieldName = field
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Comma'];

    if (allowedKeys.includes(key)) {
      return;
    }

    if (['Remark'].includes(inputFieldName || '')) {
      if (!/^[a-zA-Z0-9 ,.]$/.test(key)) {
        event.preventDefault();
        this.toastr.error('Special Characters Not Allowed Except , and .');
        return;
      }
    }
    if (validationType === 'int' && !/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }

    if (validationType === 'alpha' && !/^[a-zA-Z0-9 ,.]$/.test(key)) {
      event.preventDefault();
      return;
    }
  }





  onPaste(event: ClipboardEvent, validationType: string, field: string) {
    const pasteData = event.clipboardData?.getData('text') || '';

    if (field === 'Remark' && !/^[a-zA-Z0-9 ,.]*$/.test(pasteData)) {
      this.toastr.error('You Cannot Paste Content with Special Character');
      event.preventDefault();
      return
    }
  }
}
