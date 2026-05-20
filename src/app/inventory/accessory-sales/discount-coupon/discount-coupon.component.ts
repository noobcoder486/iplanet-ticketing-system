import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from "src/app/config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { MatDialog } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'uuid';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-discount-coupon',
  templateUrl: './discount-coupon.component.html',
  styleUrls: ['./discount-coupon.component.sass']
})
export class DiscountCouponComponent implements OnInit {

 
  currentDate: Date;
  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  SAPSOCode: string = "";
  SAPDeliveryCode: string = "";
  SAPInvoiceCode: string = "";
  DeliveryUpdateSuccess: boolean = false;
  PickingSuccess: boolean = false;
  PGISuccess: boolean = false;
  SerialUpdate: boolean = false;
  ETag: string = "";
  sapinvoiceGUID: any;
  invoiceDate: string | number | Date;
  companyObject: any;
  finalSelectedElements: any[] = [];
  InvoiceDocTypeData: any;
  LocationCode: any;
  params: any;
  errorMessage: string;
  popUpArray: any[] = [];
  hidePopup: boolean = true
  totalBaseAmount: number = 0;
  totalDiscountAmount: number = 0;
  totalNetAmount: number = 0;
  totalTaxAmount: number = 0;
  totalTaxableAmount: number = 0;
  SalesReturnGUID: any;
  SalesReturnCode: string;
  caseGuid: any;
  caseId: string;
  SalesReturnDocTypeData: string = ''
  retailCustomerCode: any;
  SalesReturnObject: any;
  isEdit: boolean = false;
  isnotApprover: boolean = true;

  LocationDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceCode: string = ''
  InvoiceGuid: string = ''
  results:any[] = []
  DiscountStatus : string;
  DiscountGUID: string
  DiscountStatusL2 : string;
  isApproverL1: boolean = false;
  isApproverL2: boolean = false;

  // PopUp Variables:-
  popUpArraySelectedIndexes: number[] =[];
  showOnlySelected= false
  selectedItemList: any[] = []
  ItemList: any[] = [];
  totalSelectedNetAmount = 0;
  totalSelectedBaseAmount = 0;
  totalSelectedDiscountAmount = 0;
  totalSelectedTaxAmount = 0;
  totalSelectedTaxableAmount = 0;
  MaterialCode : string;
  MaterialName: string;
  searchAmount: string;
  


  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private route: Router,
    private dropdownDataService: DropdownDataService

  ) { }


  ngOnInit(): void {
    this.currentDate = new Date();
    this.params = this.activatedRoute.snapshot.queryParams;

    if (Object.keys(this.params).length == 0) {
      console.log("Params are ",this.params)
      this.toastMessage.info("Can't Access this Page")
    }
    else{
      if (this.params.couponcode != null || this.params.couponcode != undefined) {
        this.isEdit = true
        this.GetDiscountObject();
      }
      else {
        this.toastMessage.error("Access Denied")
        this.location.back()
      }
    }
    // this.getApprovalSettingDetailObject()

    this.onLocationSearch({ term: "", item: [] });
  }


  getCustomerObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetRtlCustomerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.retailCustomerCode
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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
            // console.log("Customer Obkect ", response)
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (Array.isArray(data?.Customer)) {
                this.CustomerObject.push(data?.Customer[0])
              }
              else {
                this.CustomerObject.push(data?.Customer)
                this.errorMessage = "";
              }
            }
          } catch (ext) {
          }
        },
        error: err => {
          console.log(err)
        }

      }
    );
  }


  getLocationData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("Location Object ",response )
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            this.LocationObject.push(data)
            this.IsApproverObject()
          }
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }
  
  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationDD = value;
        }
      },
      error: (err) => {
        this.LocationDD = DropDownValue.getBlankObject();
      }
    });
  }



  getInvoiceObject() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetSalesReturnInvoiceObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.params.invoiceguid
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)
            console.log("Invice Data", data)
            if (data?.Totalrecords != "0") {
              // 
              this.caseGuid = data?.CaseGuid
              this.SalesReturnDocTypeData = data.InvoiceDocType == null || data.InvoiceDocType == undefined ? "" : data.InvoiceDocType
              this.caseId = data.CaseID == null || data.CaseID == undefined ? "" : data.CaseID
              this.retailCustomerCode = data.RetailCustomerCode == null || data.RetailCustomerCode == undefined ? "" : data.RetailCustomerCode
              this.InvoiceCode = data.InvoiceCode
              this.InvoiceGuid = data.InvoiceGuid
              if ( data?.InvoiceDetailObject == null || data?.InvoiceDetailObject == undefined){
                this.toastMessage.error("No Parts Found");
                this.route.navigate(["/auth/" + glob.getCompanyCode() + "/sales-return-list"]);
                // return
              }
              if (Array.isArray(data?.InvoiceDetailObject.InvoiceDetail)) {
                this.popUpArray = data?.InvoiceDetailObject.InvoiceDetail
              }
              else {
                this.popUpArray.push(data?.InvoiceDetailObject.InvoiceDetail)
              }
              
              this.popUpArray.forEach(item => {
                item.isSelected = false
              })
            }
            else {
              this.toastMessage.error("No records found")
            }
          }
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }


  GetDiscountObject(){
    this.ngxSpinnerService.show()

    let requestData = []
    requestData.push({
      "Key":"APIType",
      "Value":"GetDiscountObject"
    })
    requestData.push({
      "Key":"CouponCode",
      "Value":this.params.couponcode
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.popUpArray = []
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            console.log("Response ",response )
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("Object ", data);
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No Discount Available")
              }
              else {
                this.DiscountGUID = data?.DiscountCoupon?.DiscountGUID
                this.DiscountStatus = data?.DiscountCoupon?.DiscountCouponStatus
                this.MaterialCode = data?.DiscountCoupon?.MaterialCode
                this.LocationCode = data?.DiscountCoupon?.LocationCode
                this.retailCustomerCode = data?.DiscountCoupon?.RetailCustomerCode
                this.getCustomerObject()
                this.getLocationData()
                this.popUpArray.push(data?.DiscountCoupon)
                console.log("Pop up", this.popUpArray)
              }
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    ); 
  }

  async IsApproverObject(){
    // this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "DiscountApproval"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value":this.LocationCode 
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest ={
      "content": strRequestData,
    }
    console.log("Approval Object ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let userName = sessionStorage.getItem(glob.GLOBALVARIABLE.USERNAME);
            
            let data = JSON.parse(response?.ExtraData);
            console.log("Approval Object Response", data)
            console.log(data?.ApprovalSettingDetail?.ApprovalPerson)
            if (data?.ApprovalSettingDetail?.ApprovalPerson == userName ) {
              if ( data?.ApprovalSettingDetail?.ApprovalLevel == 'L1') {
                this.DiscountStatus == 'SENT FOR APPROVAL' ? this.isnotApprover = false: this.isnotApprover = true
                // this.toastMessage.success("Approver Manager Access") 
                this.isApproverL1 = true
              } 
              else if ( data?.ApprovalSettingDetail?.ApprovalLevel == 'L2') {
                // this.isApproverL2 = true
                this.DiscountStatus == 'PARTIALLY APPROVED' ? this.isnotApprover = false : this.isnotApprover = true
                // this.toastMessage.success("Cluster Manager Access")
                this.isApproverL2 = true
              }
            }
          } 
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
          
        }
      });

  }




  updateDiscount( status)
  {
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    // this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key":"APIType",
      "Value":"SaveDiscount"
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key":"DiscountGUID",
      "Value": this.DiscountGUID
    })
    requestData.push({
      "Key":"CustomerCode",
      "Value":this.retailCustomerCode
    })
    requestData.push({
      "Key":"MaterialCode",
      "Value": this.MaterialCode
    })
    requestData.push({
      "Key":"LocationCode",
      "Value": this.LocationCode
    })
    let DiscountData = this.popUpArray[0]
    console.log("Pop Up ", DiscountData)
    requestData.push({
      "Key":"ExpiredDate",
      "Value": DiscountData.ExpiredDate
    })
    requestData.push({
      "Key":"IsConsumed",
      "Value": DiscountData.IsConsumed
    })
    requestData.push({
      "Key":"UnitPrice",
      "Value": DiscountData.UnitPrice
    })
    requestData.push({
      "Key":"DiscountAmount",
      "Value": DiscountData.DiscountAmount
    })
    requestData.push({
      "Key":"CouponCode",
      "Value": DiscountData.CouponCode
    })
    requestData.push({
      "Key":"DiscountCouponStatus",
      "Value": status == 'REJECTED' ?  'REJECTED' : (this.isApproverL1 ? 'PARTIALLY APPROVED' : 'APPROVED')
    })
    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Status Change", requestData)
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxSpinnerService.hide()
          try {
            
            let response = JSON.parse(Value.toString());
            console.log("Status Change Response ",response)
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No Discount Available")
              }
              else {
                this.route.navigate(['auth/' + glob.getCompanyCode() + '/discount-coupon-list'])
                this.toastMessage.success("Coupon Status changed Successfully")
              }
            }
            else {
              
              let errorMessage = response.ErrorMessage;
               const parser = new xml2js.Parser({ strict: false, trim: true });
               parser.parseString( errorMessage , (error, result) => {
                 const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                 errorMessages.forEach((errorMessage) => {
                   this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                 });
               }); 
            }
          } catch (ext) {
              
              console.log("Error ", ext)
              this.toastMessage.error(ext, "Error:-", { closeButton: true, disableTimeOut: true });
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    ); 
  }

 
  
  TotalNetAmount() {
    this.totalBaseAmount = 0;
    this.totalDiscountAmount = 0;
    this.totalNetAmount = 0;
    this.totalTaxAmount = 0;
    this.totalTaxableAmount = 0;

    this.finalSelectedElements.forEach((item) => {
      this.totalTaxableAmount += parseFloat(item.TaxableAmount);
      this.totalTaxAmount += parseFloat(item.TaxAmount);
      this.totalNetAmount += parseFloat(item.NetAmount);
      this.totalDiscountAmount += parseFloat(item.DiscountAmount);
      this.totalBaseAmount += parseFloat(item.BaseAmount);
    });
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.totalNetAmount = parseFloat(this.totalNetAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
  }


}