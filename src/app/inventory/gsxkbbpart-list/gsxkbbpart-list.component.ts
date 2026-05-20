import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { Router } from '@angular/router';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'
import { DatePipe } from '@angular/common';
import xml2js from 'xml2js';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-gsxkbbpart-list',
  templateUrl: './gsxkbbpart-list.component.html',
  styleUrls: ['./gsxkbbpart-list.component.css']
})
export class GsxkbbpartListComponent implements OnInit {
  typeSelected = 'ball-clip-rotate';
 
  GsxKbbPartList: any[] = [];
  UpdatedexpiryDate: Date | null = null;
  isUpdateexpiryDate: boolean = false;

  StatusList:any[]=['Damaged' , 'Missing']
  SelectedStatus:any;

  currentRepairId: any;
  currentSequenceNo: any;
  currentExpiryDate: any;

  RepairId: any
  PartNumber: any
  errorMessage: string;

    isDateUpdate : boolean=false;
    isStatus : boolean =false;

    expiryDate:any;

  constructor(
    private route: Router,
    private gsxService: GsxService, private ngxSpinnerService: NgxSpinnerService,
    private dynamicService: DynamicService,
    private reportService: ReportService,
    private toast: ToastrService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.getGsxKbbPartList()
  }

  UpdateExpiryDate(item, type) {
    
    this.isUpdateexpiryDate = true;
    this.currentSequenceNo = item.sequenceNumber;
    this.currentExpiryDate = item.expiryDate;
    this.currentRepairId = item.repairId;
     this.isDateUpdate = type == 'EXPIRYDATE' ? true:false;
    this.isStatus = type =='STATUS' ? true : false;

  }

  closepop() {
    this.isUpdateexpiryDate = false;
    this.currentSequenceNo = null;
    this.currentExpiryDate = null;
    this.currentRepairId = null;
    this.UpdatedexpiryDate = null;
  }

  getGsxKbbPartList() {
    
    this.GsxKbbPartList = [];
    this.ngxSpinnerService.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetGsxKbbPartlist"
    });
    requestData.push({
      "Key": "partNumber",
      "Value": this.PartNumber == null || this.PartNumber == undefined ? '' : this.PartNumber.trim()
    });
    requestData.push({
      "Key": "repairId",
      "Value": this.RepairId == null || this.RepairId == undefined ? '' : this.RepairId
    });

    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log('contentrequestdata', contentRequest);
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {

              let data = JSON.parse(response.ExtraData);
              if (Array.isArray(data.GsxKbbPartLists.GSXBulkPartRow)) {

                this.GsxKbbPartList = data.GsxKbbPartLists.GSXBulkPartRow;
                this.ngxSpinnerService.hide();
                console.log('this.GsxKbbPartList', this.GsxKbbPartList);
              }
              else {
                this.GsxKbbPartList.push(data.GsxKbbPartLists.GSXBulkPartRow)

                console.log('this.GsxKbbPartList', this.GsxKbbPartList);

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

  UpdateGSXBulkPartListExpiryDate(UpdationType) {
    
    
    const presentDate = new Date();
    const formattedpresentDate = this.datePipe.transform(presentDate, 'yyyy-MM-dd');
    const UpdatedexpiryDateformatted = this.datePipe.transform(this.UpdatedexpiryDate, 'yyyy-MM-dd');


    if(UpdationType == 'EXPIRYDATE')
    {
    if (this.UpdatedexpiryDate == null || this.UpdatedexpiryDate == undefined) {
      this.toast.error('Updated Lock Date Cannot be empty');
      return
    }
    if (UpdatedexpiryDateformatted < formattedpresentDate) {
      this.toast.error('Updated Lock Date Cannot be past Date!');
      return
    }
  }
    this.ngxSpinnerService.show()
    let requestData = [];
    
    requestData.push({
      "Key": "ApiType",
      "Value": "GSXBulkPartListExpiryDate"
    });
    requestData.push({
      "Key": "UpdationType",
      "Value": UpdationType
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "repairId",
      "Value": this.currentRepairId
    });
    requestData.push({
      "Key": "sequenceNumber",
      "Value": this.currentSequenceNo
    });
    requestData.push({
      "Key": "UpdatedExpiryDate",
      "Value": UpdatedexpiryDateformatted
    });
    requestData.push({
      "Key": "Status",
      "Value": this.SelectedStatus == null || this.SelectedStatus == undefined ? '' : this.SelectedStatus
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
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.ngxSpinnerService.hide()
            this.toast.success("Updated  Successfully");
            window.location.reload();

          }
          else {

            this.errorMessage = response.ReturnMessage;
            this.toast.error(response.ReturnMessage)
            this.ngxSpinnerService.hide();

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

   ExportExpiredGsxkbbpartlist() {
    
    const expiryDateformatted = this.datePipe.transform(this.expiryDate, 'yyyy-MM-dd');
    if (expiryDateformatted == null || expiryDateformatted == undefined || expiryDateformatted == '') {
      this.toast.error('Expiry Date  cannot be empty !')
      return
    }
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportExpiredGsxkbbpartlist"
    })
 
    requestData.push({
      "Key": "expiryDate",
      "Value": expiryDateformatted == null || expiryDateformatted == undefined ? '' : expiryDateformatted
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
      {
        next: (Value) => {
          try {
          const expiryDateformatted = this.datePipe.transform(this.expiryDate, 'yyyy-MM-dd');

            let response = JSON.parse(Value.toString());
            const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
            var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const fileName = `Expired_Gsxkbbpartlist_${expiryDateformatted}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
          
        }
      }
    );
  }



    selectFile(type) {
      
      if (type == 'GsxKbbPartExcelFormat') {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput.click();
      }  
    }

    selectedFileNameGsxKbbPart: string | null = null;
    async FileUploadGsxKbbPartBulk(event: any) {
      
      const shouldContinue = confirm("Are you sure you want to continue")
      if (shouldContinue == false) {
        return
      }
  
  
      const file = event.target.files[0];
      if (file) {
        this.selectedFileNameGsxKbbPart = file.name;
        let formData = new FormData();
        var filename = file.name;
        console.log("File ", file);
        formData.append('file', file, filename);
        formData.append('ApiType', 'UpdateGSXBulkPartList');
        formData.append('Module', 'UpdateGSXBulkPartList');
        this.errorMessage = "";
     this.ngxSpinnerService.show();
        this.dynamicService.saveExcelData(formData).subscribe(
          {
            next: (value) => {
              try {
                
                event.target.value = null;
  
                let response = JSON.parse(JSON.stringify(value));
                console.log('Response:', response);
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  let data1 = response.ReturnMessage;
                  console.log('Data:', data);
                  console.log('Data:', data1);
                  if (response.ReturnCode == '0') {
                    this.toast.success('GsxKbbPart updated Successfully');
                    this.getGsxKbbPartList();
                    
                  }
                  else {
                    console.log("Error Response: ", response)
                    let errorMessage = response.ErrorMessage;
                    this.toast.error(errorMessage);
                    const parser = new xml2js.Parser({ strict: false, trim: true });
                    parser.parseString(errorMessage, (error, result) => {
                      const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                      console.log("Messages : ", errorMessages)
                      errorMessages.forEach((errorMessage) => {
                        console.log("Error Message: ", error)
                        this.toast.error(errorMessage.ERRORMESSAGE);
                      });
                    });
                  }
                }
              }
              catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              event.target.value = null;
              console.log("Error Message:- ", err)
              const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
              errors.forEach(error => {
                const messageIndex = error.indexOf("Message: ");
                if (messageIndex !== -1) {
                  const messageSubstring = error.substring(messageIndex + 9).trim();
                  const message = JSON.parse(messageSubstring).message;
                  this.toast.error("Error:-  " + message);
                } else {
                  this.toast.error("Error parsing the error message.");
                }
              });
            }
          })
      }
    }



     ExcelFormat = ["repairId", "sequenceNumber" ,"shipTo", "updatedExpiryDate"];
    DownloadSample(){
      const blankData = Array(10).fill({});
      const blankRows = blankData.map(() => {
        return {
          repairId: '',
          sequenceNumber: '',
          shipTo: '',
          updatedExpiryDate: ''
        };
      });
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(blankRows, { header: this.ExcelFormat });
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'UpdateExpiryDate.xlsx');
    }
}