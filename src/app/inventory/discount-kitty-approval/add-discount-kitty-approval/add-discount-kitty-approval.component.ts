import { DropDownValue, DropdownDataService, } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { FormBuilder, FormGroup, Validators, } from "@angular/forms";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import { Component, OnInit } from "@angular/core";
import * as glob from "src/app/config/global";
import { ToastrService } from "ngx-toastr";
import xml2js from "xml2js";
import { ActivatedRoute, Router } from "@angular/router";
import { v4 as uuidv4, parse } from 'uuid';
import { Columns } from "src/app/models/column.metadata";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { PaginationMetaData } from "src/app/models/pagination.metadata";
import { NgxSpinnerService } from "ngx-spinner";
import { Console } from "console";

@Component({
  selector: 'app-add-discount-kitty-approval',
  templateUrl: './add-discount-kitty-approval.component.html',
  styleUrls: ['./add-discount-kitty-approval.component.css']
})
export class AddDiscountKittyApprovalComponent implements OnInit {

  discountKittyForm: FormGroup;
  Location: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  jobPagination: PaginationMetaData;
  LocationData = new Set<string>();
  ApproverName: string;
  formTitle: string = "Add";
  params: any;
  isEdit: boolean = false;
  errorMessage: string;
  DiscountKittyGUID
  ApprovalGUID
  ExpiryDate
  results: any[] = [];
  CouponCode: string;
  ApprovalObject
  RemarkLevel
  LocationCode
  userName
  ApprovalStatus
  ifStatusChange
  isApproverL1
  isApproverL2

  RequestRemark
  RequestAmount
  newTotalDiscount 

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private ngxSpinner: NgxSpinnerService,
  ) { }


  columns: Columns[] = [
    { datatype: "STRING", field: "CouponCode", title: "Coupon Code" },
    { datatype: "DATE", field: "ExpiryDate", title: "Expiry Date" },
    { datatype: "STRING", field: "DiscountAmount", title: "Discount Amount" },
    { datatype: "STRING", field: "DiscountSpent", title: "Discount Spent" },
    { datatype: "STRING", field: "DiscountPerInvoice", title: "Discount Per Invoice" },
    { datatype: "STRING", field: "TotalDiscount", title: "Total Discount" },
    { datatype: "DATE", field: "CreatedDate", title: "Created Date" },

  ];


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    this.userName = glob.getLogedInUser().UserDetails.UserName;
    if (this.params.guid != null && this.params.guid !== undefined) {
      this.ApprovalGUID = this.params.guid;
      this.getData('');
      
      this.formTitle = "Edit";
      this.isEdit = true;
    }
    else {
      this.ApprovalGUID = uuidv4()
      this.GetDiscountKittyObject4Approval()
    }

    this.discountKittyForm = this.formBuilder.group({
      // LocationCode: [{ value: this.LocationCode, disabled: this.isEdit }, Validators.required],
      ApproverName: [null, Validators.required],
      TotalDiscount: [null, Validators.required],
      DiscountPerInvoice: [null, Validators.required],
    });

    this.onLocationSearch({ term: "", item: [] });
  }

  GetDiscountKittyObject4Approval() {

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDiscountKittyObject4Approval"
    }),
      requestData.push({
        "Key": "ApproverName",
        "Value": this.userName
      });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("res", response)
          if (response.ReturnCode === '0') {

            let data = JSON.parse(response.ExtraData);
            this.ApprovalObject = data.DiscountKittyList.DiscountKitty
            this.DiscountKittyGUID = this.ApprovalObject.DiscountKittyGUID
            console.log('from  GetDiscountKittyObject4Approval', this.ApprovalObject);
            this.getDataKitty('')

          } else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  async IsApproverObject() {
  

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "DiscountKittyApproval"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest = {
      "content": strRequestData,
    }
    try {
      const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
      const value = await lastValueFrom(observable);

      const response = JSON.parse(value.toString());
     
      if (response.ReturnCode == '0') {

        let extraDataResponse = JSON.parse(response?.ExtraData);
        console.log("Approval Object Extra", extraDataResponse);
        console.log(extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson);
        if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName) {
          let level = extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel
          if (extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L1') {
            this.ApprovalStatus == 'SENT FOR APPROVAL' ? this.ifStatusChange = true : this.ifStatusChange = false
            this.isApproverL1 = true
          }
          else if (extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L2') {
            this.ApprovalStatus == 'PARTIALLY APPROVED' ? this.ifStatusChange = true : this.ifStatusChange = false
            this.isApproverL2 = true
          }
        }
         
      } else {
        console.log("Error in getting the Approval Object");
      }
    } catch (error) {
      console.log("Error:- ", error);
    }
  }




  // RefundApproveReject(status) {



  //   let requestData = [];
  //   requestData.push({
  //     "Key": "APIType",
  //     "Value": "RequestStatusChange"
  //   });
  //   requestData.push({
  //     "Key": "ApprovalGUID",
  //     "Value": this.ApprovalGUID
  //   });
  //   if (this.isApproverL1 == true) {
  //     requestData.push({
  //       "Key": "ApprovalStatus",
  //       "Value": status == 'APPROVED' ? 'PARTIALLY APPROVED' : 'REJECTED'
  //     });
  //     requestData.push({
  //       "Key": "Status",
  //       "Value": 'NA'
  //     });

  //   }
  //   else if (this.isApproverL2 == true) {
  //     requestData.push({
  //       "Key": "ApprovalStatus",
  //       "Value": status
  //     });
  //     requestData.push({
  //       "Key": "Status",
  //       "Value": status == 'APPROVED' ? 'PENDING' : 'REJECTED'
  //     });
  //   }
  //   const ShouldContinue = confirm("Are you sure? Do you want to continue")
  //   if (ShouldContinue == false) {
  //     return
  //   }
  //   // this.showSpinner()
  //   // if(this.submitClicked == true)
  //   // {
  //   //   return;
  //   // }
  //   // this.submitClicked=true 
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   console.log("Before Changing Status SP:- ", requestData)
  //   // // TODO
  //   // this.SaveProcessApprovalStatus(status);
  //   // return
  //   this.ngxSpinner.show()
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (Value) => {
  //         // this.submitClicked= false
  //         let response = JSON.parse(Value.toString());
  //         if (response.ReturnCode == '0') {
  //           let data = JSON.parse(response?.ExtraData);
  //           this.ApprovalStatus = data.ApprovalStatus

  //           this.SaveProcessApprovalStatus(status);
  //           // this.hideSpinner()
  //           this.ngxSpinner.hide()
  //         }
  //         else {
  //           // this.submitClicked= false
  //           // this.hideSpinner()
  //           this.ngxSpinner.hide()
  //           // console.log("Error Response: " , response)
  //           this.errorMessage = response.ErrorMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString(this.errorMessage, (error, result) => {
  //             const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
  //             // console.log("Messages : " ,errorMessages)
  //             errorMessages.forEach((errorMessage) => {
  //               // console.log("Error Message: " , error)
  //               this.toastMessage.error(errorMessage.ERRORMESSAGE);
  //             });
  //           });
  //         }
  //       },
  //       error: err => {
  //         // this.submitClicked= false
  //         // this.hideSpinner()
  //         this.ngxSpinner.hide();
  //         // console.log("Error Message:- ", err)
  //         const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
  //         errors.forEach(error => {
  //           const messageIndex = error.indexOf("Message: ");
  //           if (messageIndex !== -1) {
  //             const messageSubstring = error.substring(messageIndex + 9).trim();
  //             const message = JSON.parse(messageSubstring).message;
  //             this.toastMessage.error("Error:-  " + message);
  //           } else {
  //             this.toastMessage.error("Error parsing the error message.");
  //           }
  //         });
  //       }

  //     }
  //   );
  // }
  // SaveProcessApprovalStatus(status) {
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "APIType",
  //     "Value": "SaveProcessApprovalStatus"
  //   });
  //   requestData.push({
  //     "Key": "ProcessType",
  //     "Value": 'DiscountKittyApproval'
  //   });
  //   requestData.push({
  //     "Key": "GUID",
  //     "Value": this.ApprovalGUID
  //   });
  //   if (this.isApproverL1 == true) {
  //     requestData.push({
  //       "Key": "Status",
  //       "Value": status
  //     });
  //     requestData.push({
  //       "Key": "ApprovalLevel",
  //       "Value": 'L1'
  //     });
  //   }
  //   else if (this.isApproverL2 == true) {
  //     requestData.push({
  //       "Key": "Status",
  //       "Value": status
  //     });
  //     requestData.push({
  //       "Key": "ApprovalLevel",
  //       "Value": 'L2'
  //     });
  //   }
  //   // let remark = this.RemarkUploadList[this.RemarkLevel]?.RemarkDescription
  //   requestData.push({
  //     "Key": "ApprovalRemark",
  //     "Value": "" // remark == null || remark == undefined ? '' : remark
  //   });

  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   console.log("Before Changing Status SP:- ", requestData)
  //   // // TODO
  //   // return
  //   this.ngxSpinner.show()
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (Value) => {
  //         // this.submitClicked= false
  //         this.ngxSpinner.hide()
  //         let response = JSON.parse(Value.toString());
  //         if (response.ReturnCode == '0') {
  //           let data = JSON.parse(response?.ExtraData);
  //           console.log("After Process ", response)
  //           this.toastMessage.success("Status Changed Successfully")
  //           // this.hideSpinner()
  //           this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
  //         }
  //         else {
  //           // this.submitClicked= false
  //           // this.hideSpinner()
  //           // console.log("Error Response: " , response)
  //           this.errorMessage = response.ErrorMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString(this.errorMessage, (error, result) => {
  //             const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
  //             // console.log("Messages : " ,errorMessages)
  //             errorMessages.forEach((errorMessage) => {
  //               // console.log("Error Message: " , error)
  //               this.toastMessage.error(errorMessage.ERRORMESSAGE);
  //             });
  //           });
  //         }
  //       },
  //       error: err => {
  //         // this.submitClicked= false
  //         // this.hideSpinner()
  //         this.ngxSpinner.hide();
  //         // console.log("Error Message:- ", err)
  //         const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
  //         errors.forEach(error => {
  //           const messageIndex = error.indexOf("Message: ");
  //           if (messageIndex !== -1) {
  //             const messageSubstring = error.substring(messageIndex + 9).trim();
  //             const message = JSON.parse(messageSubstring).message;
  //             this.toastMessage.error("Error:-  " + message);
  //           } else {
  //             this.toastMessage.error("Error parsing the error message.");
  //           }
  //         });
  //       }

  //     }
  //   );
  // }


  controlValidations() {
    let isValid = true
    Object.keys(this.discountKittyForm.controls).forEach(field => {
      let controlValue = this.discountKittyForm.get(field).value;
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty");
        isValid = false
      }
    });
    if (this.ExpiryDate == null || this.ExpiryDate == undefined) {
      this.toastMessage.error("Expiry Date cannot be Empty");
      isValid = false
    }
    return isValid
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
      })
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.Location = value;
          }
        },
        error: (err) => {
          this.Location = DropDownValue.getBlankObject();
        },
      });
  }

  search(event) {
    if (this.CouponCode == null || this.CouponCode == undefined) {
      this.toastMessage.error("Please enter CouponCode");
      return;
    }
    this.getData('');
  }

  getData(eventDetail) {

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDiscountKittyApprovalObject"
    }),
      requestData.push({
        "Key": "ApprovalGUID",
        "Value": this.params.guid
      }),

      requestData.push({
        "Key": "PageNo",
        "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
      }),
      requestData.push({
        "Key": "PageSize",
        "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
      });


    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("res", response)
          if (response.ReturnCode === '0') {

            let data = JSON.parse(response.ExtraData);
            this.ApprovalObject = data.DiscountKittyApproval.DiscountKittyApproval
            this.DiscountKittyGUID = this.ApprovalObject.DiscountKittyGUID
            this.LocationCode = this.ApprovalObject.LocationCode
            this.ApprovalStatus = this.ApprovalObject.RequestStatus
            this.RequestAmount = this.ApprovalObject.RequestAmount
            this.RequestRemark=this.ApprovalObject.RequestRemark

            console.log("this is ApprovalObject", this.ApprovalObject);
            this.getDataKitty('')

          } else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }


  getDataKitty(eventDetail) {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDiscountKittyObject"
    }),
      requestData.push({
        "Key": "DiscountKittyGUID",
        "Value": this.DiscountKittyGUID
      }),
      requestData.push({
        "Key": "CouponCode",
        "Value": eventDetail.CouponCode == null || eventDetail.CouponCode == undefined ? "" : eventDetail.CouponCode

      }),
      requestData.push({
        "Key": "PageNo",
        "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
      }),
      requestData.push({
        "Key": "PageSize",
        "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
      });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    }

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("res", response)
          if (response.ReturnCode === '0') {
            let data = JSON.parse(response.ExtraData);

            const discountKitty = data?.DiscountKitty?.DiscountKitty;
            const discountKittyLog = data?.DiscountKitty?.DiscountKitty?.DiscountKittyLog?.DiscountKittyLog;


            // console.log("dis", data);
            const expiryDate = new Date(discountKitty?.ExpiryDate);
            const localDate = new Date(expiryDate.getTime() - (expiryDate.getTimezoneOffset() * 60000));
            this.ExpiryDate = localDate.toISOString().split('T')[0];
            this.discountKittyForm.patchValue({
              ApproverName: discountKitty?.ApproverName,
              TotalDiscount: discountKitty?.TotalDiscount,
              DiscountPerInvoice: discountKitty?.DiscountPerInvoice,
            });

            Array.isArray(discountKittyLog)
              ? this.results = discountKittyLog
              : this.results = [discountKittyLog]
            this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
            this.IsApproverObject()
          } else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }




  PageChange(event) {
    switch (event.eventType) {
      case "PageChange":
        this.getData(event.eventDetail)
        // setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
  }

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }

  cancelfunction() {
    this.router.navigate(['auth/' + glob.getCompanyCode() + '/discount-kitty-approval-list'])

  }


 onApproved() {
    this.newTotalDiscount = Number( this.discountKittyForm.controls["TotalDiscount"].value) + Number(this.RequestAmount)
 
 if (!this.controlValidations()) {
   return
 }
 let requestData = [];
 requestData.push({
   "Key": "APIType",
   "Value": "UpdateTotalDiscountKitty"
 }),
   requestData.push({
     "Key": "DiscountKittyGUID",
     "Value": this.DiscountKittyGUID
   }),
   requestData.push({
     "Key": "ApprovalGUID",
     "Value": this.ApprovalGUID
   }),
   requestData.push({
     "Key": "TotalDiscount",
     "Value" : this.newTotalDiscount
   });

 let strRequestData = JSON.stringify(requestData);
 let contentRequest = {
   "content": strRequestData
 };
 this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
   {
     next: (value) => {
       
       let response = JSON.parse(value.toString());
       console.log('this is from inside the onapproved  ' , response);
       if (response.ReturnCode === '0') {
         this.toastMessage.success("Approved Successfully");
         this.cancelfunction();
       } else {
         this.errorMessage = response.ReturnMessage;
         const parser = new xml2js.Parser({ strict: false, trim: true });
         parser.parseString(response.ErrorMessage, (err, result) => {
           response['errorMessageJson'] = result;
           this.handleError(response);
         });
       }
     },
     error: err => {
       console.error(err);
     }
   });
}
  
  onSubmit() {
     
       this.newTotalDiscount = Number( this.discountKittyForm.controls["TotalDiscount"].value) + Number(this.RequestAmount)
      
    
    if (!this.controlValidations()) {
      return
    }
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveDiscountKitty"
    }),
      requestData.push({
        "Key": "DiscountKittyGUID",
        "Value": this.DiscountKittyGUID
      }),
      requestData.push({
        "Key": "ApproverName",
        "Value": this.discountKittyForm.controls["ApproverName"].value
      }),
      requestData.push({
        "Key": "ExpiryDate",
        "Value": this.ExpiryDate
      }),

      requestData.push({
        "Key": "TotalDiscount",
        "Value" : this.newTotalDiscount
      }),
      requestData.push({
        "Key": "DiscountPerInvoice",
        "Value": this.discountKittyForm.controls["DiscountPerInvoice"].value
      })

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          console.log('this is from inside the submit function ' , response);
          if (response.ReturnCode === '0') {
            this.toastMessage.success("Form Submitted Successfully");
            this.cancelfunction();
          } else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });
          }
        },
        error: err => {
          console.error(err);
        }
      });
  }

  changeStatus() {
  
    if (this.ApprovalStatus == 'SENT FOR APPROVAL' && this.isApproverL1== true) {
      this.ApprovalStatus = 'PARTIALLY APPROVED';
      this.onSendRequest()
    }
    else if (this.ApprovalStatus == 'PARTIALLY APPROVED' && this.isApproverL2==true) {
      this.ApprovalStatus = 'APPROVED';
      this.onApproved()
    }
    else {
      this.toastMessage.error('Unauthorised Acess');
      return
    }
    
  }

  rejectRefundRequest(){
    if (this.ApprovalStatus == 'SENT FOR APPROVAL' && this.isApproverL1== true) {
      this.ApprovalStatus = 'REJECTED';
      this.onSendRequest()
    }
    else if (this.ApprovalStatus == 'PARTIALLY APPROVED' && this.isApproverL2==true) {
      this.ApprovalStatus = 'REJECTED';
      this.onSendRequest()
    }

    else {
      this.toastMessage.error('Unauthorissed Acess');
      return
    }
  }




  onSendRequest() {

      
    if(this.LocationCode==null || this.LocationCode==undefined ){
      this.toastMessage.error("Location cannot be Empty !!");
      return 
     }
 
    if(this.RequestAmount==null || this.RequestAmount==undefined ){
      this.toastMessage.error("Request Amount cannot be Empty !!");
      return
     }
  
   
 
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveDiscountKittyApproval"
    }),
      requestData.push({
        "Key": "ApprovalGUID",
        "Value": this.ApprovalGUID
      }),
      requestData.push({
        "Key": "DiscountKittyGUID",
        "Value": this.DiscountKittyGUID
      }),
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationCode
      }),
      requestData.push({
        "Key": "ApproverName",
        "Value": this.userName
      }),

      requestData.push({
        "Key": "RequestRemark",
        "Value": this.RequestRemark
      }),
      requestData.push({
        "Key": "RequestAmount",
        "Value": this.RequestAmount
      }),
      requestData.push({
        "Key": "RequestStatus",
        "Value": (this.ApprovalStatus == null || this.ApprovalStatus == undefined) ? 'SENT FOR APPROVAL' : this.ApprovalStatus
      });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
           
          let response = JSON.parse(value.toString());
          if (response.ReturnCode === '0') {
            this.toastMessage.success("Form Submitted Successfully");
            this.cancelfunction();
          } else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });
          }
        },
        error: err => {
          console.error(err);
        }
      });
  }



  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
    error.forEach(err => {
      this.toastMessage.error("Error:- ", err)
    })
  }

}
