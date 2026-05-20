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
import { BehaviorSubject } from "rxjs";
import { PaginationMetaData } from "src/app/models/pagination.metadata";

@Component({
  selector: 'app-add-discount-kitty',
  templateUrl: './add-discount-kitty.component.html',
  styleUrls: ['./add-discount-kitty.component.css']
})
export class AddDiscountKittyComponent implements OnInit {
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
  ExpiryDate
  results: any[] = [];
  CouponCode: string;

  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
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
    if (this.params.guid != null && this.params.guid !== undefined) {
      this.DiscountKittyGUID = this.params.guid;
      this.getData('');
      this.formTitle = "Edit";
      this.isEdit = true;
    }
    else{
      this.DiscountKittyGUID = uuidv4()
    }

    this.discountKittyForm = this.formBuilder.group({
      // LocationCode: [{ value: this.LocationCode, disabled: this.isEdit }, Validators.required],
      ApproverName: [null, Validators.required],
      TotalDiscount: [null, Validators.required],
      DiscountPerInvoice : [null, Validators.required],
    });

    this.onLocationSearch({ term: "", item: [] });
  }

  controlValidations() {
    let isValid = true
    Object.keys(this.discountKittyForm.controls).forEach(field => {
      let controlValue = this.discountKittyForm.get(field).value;
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty");
        isValid = false
      }
    });
    if ( this.ExpiryDate == null || this.ExpiryDate == undefined){
      this.toastMessage.error( "Expiry Date cannot be Empty");
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
      "Value": "GetDiscountKittyObject"
    }),
   requestData.push({
      "Key": "DiscountKittyGUID",
      "Value": this.params.guid
    });
    requestData.push({
      "Key": "CouponCode",
      "Value": this.CouponCode
    });
    requestData.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
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
          console.log("res",response)
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
            
            if(discountKittyLog){
              Array.isArray(discountKittyLog) 
              ? this.results = discountKittyLog
              : this.results = [discountKittyLog]
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
            }
            else{
              this.detail.next({ totalRecord: 0, Data: ''});
            }
       
          } else {
            console.log("Messages : " ,response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( this.errorMessage , (error, result) => {
              console.log("Error Message: " , error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toastMessage.error(errorMessage.ERRORMESSAGE);
              });
            }); 
          }
        },
        error: err => {
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex != -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error( message, "Error:- ");
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });        }
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
    this.router.navigate(['auth/' + glob.getCompanyCode() + '/discount-kitty-list'])

  }


  onSubmit() {
    if (!this.controlValidations()){
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
      "Value": this.discountKittyForm.controls["TotalDiscount"].value
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
    error.forEach( err => {
      this.toastMessage.error("Error:- ", err)
    })
  }
}
