import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from "../../../config/global";
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
import { FormGroup } from '@angular/forms';
import { Onsite } from 'src/app/transaction/onsite-process/onsite.metadata';


@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.component.html',
  styleUrls: ['./add-reservation.component.css']
})
export class AddReservationComponent implements OnInit {


  currentDate: Date;
  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  LocationCode: any;
  params: any;
  errorMessage: string;
  popUpArray: any[] = [];
  hidePopup: boolean = true
  ReservationGUID: any;
  ReservationCode: string;
  ReservationDocType: string = ''
  retailCustomerCode: any;
  ReservationObject: any;
  isEdit: boolean = false;
  approverUser: string = '';
  isnotApprover: boolean = true;
  userName: string;
  posttoAppButton = false

  LocationDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceCode: string = ''
  InvoiceGuid: string = ''
  results: any[] = []
  ApprovalStatus: string;
  ReservationStatus: string;
  isApproverL1: boolean = false;
  isApproverL2: boolean = false;
  CreatedDate: string
  ProductName: DropDownValue = this.getBlankObject();
  ProductList: any[] 

  submitClicked = false

  //Customer Object
  CustomerFirstName:any;
  CustomerLastName:any;
  CustomerMobileNo:any;
  CustomerEmailId:any;
  CustomerAddressLine1:any;
  CustomerAddressLine2:any='';
  CustomerAddressLine3: string
  CustomerPincode:any;
  CustomerAddressLandmark:any;
  CustomerCity:any;
  CustomerCountry
  CustomerState
  ProblemOrRemark
  @Output() AddCustomerData = new EventEmitter<any>();
  @Output() closeAddCustomer = new EventEmitter<any>();

  // D Repair 
  RepairId
  OnsiteList: any[] =[]
  RepairObject : Onsite 
  ShipToLocation: string 

  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private gsxService: GsxService,
  ) { }



  ngOnInit(): void {
    this.currentDate = new Date();
    this.params = this.activatedRoute.snapshot.queryParams;
    this.onLocationSearch({ term: "", item: [] });

    if (Object.keys(this.params).length == 0) {
      // console.log("Params are ",this.params))
      this.toastMessage.warning("Access Denied")
      this.location.back()
    }
    else {

      if ( this.params.rt == 'RESV'){
        if (this.params.rc != null || this.params.rc != undefined) {
          if (this.params.customercode != null && this.params.customercode != undefined) {
            this.getCustomerObject()
          }
          this.isEdit = true
          this.ReservationCode = this.params.rc
          this.getReservationObject()
        }
        else {
          this.toastMessage.error("Reservation Not Found")
          this.location.back()
        }
      }
      else if ( this.params.rt == 'DREPAIR'){
        if ( this.params.rid ){
        }
        this.ReservationObject = {
          SerialNo:  '',
          ProductFamily:  '',
          ProductDescription:  '',
          WarrantyStatus:  '',
          ProblemOrRemark:  '', 
          PaymentMode:  'NA',
          Amount:  '0',
          PaymentTransactionNo:  '',
        };

      }

      const allowedParams = ['customercode', 'locationcode', 'rc', 'rt', 'rid'];

      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }

    }
  }

  getRepairDetails() {
    let searchData = { "repairId": this.RepairId };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = "CBE5"
    var CompanyCode = glob.getCompanyCode()
    this.ngxSpinnerService.show()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
    {
      next: (value) => {
        
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.toastMessage.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
            var errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
          }
          else {
            this.RepairObject = response
            console.log("RepairObject ", this.RepairObject)
            this.ReservationObject = {
              SerialNo:  this.RepairObject.device.identifiers.serial,
              ProductFamily:  this.RepairObject.device.productName.split(' ')[0],
              ProductDescription:  this.RepairObject.device.productName,
              WarrantyStatus:  "IN-WARRANTY",
              // customerFirstName:  this.RepairObject.customer.firstName,
              // customerLastName:  this.RepairObject.customer.lastName,
              // customerMobileNo:  this.RepairObject.customer.primaryPhone,
              // customerEmailId:  this.RepairObject.customer.emailAddress,
              // customerCity:  this.RepairObject.customer.address[0]?.city,
              ProblemOrRemark:  this.RepairObject.componentIssues[0].issueDescription || '', 
              PaymentMode:  'NA',
              Amount:  this.RepairObject.price.totalAmount,
              PaymentTransactionNo:  '',
            };
             this.CustomerFirstName = this.RepairObject?.customer?.firstName || '';
             this.CustomerLastName = this.RepairObject?.customer?.lastName || '';
             this.CustomerMobileNo = this.RepairObject?.customer?.primaryPhone || '';
             this.CustomerEmailId = this.RepairObject?.customer?.emailAddress || '';
             this.CustomerAddressLine1 = this.RepairObject?.customer?.address?.[0]?.line1 || '';
             this.CustomerAddressLine2 = this.RepairObject?.customer?.address?.[0]?.line2 || '';
             this.CustomerAddressLandmark = this.RepairObject?.customer?.address?.[0]?.line3 || '';
             this.CustomerPincode = this.RepairObject?.customer?.address?.[0]?.postalCode || '';
             this.CustomerCity = this.RepairObject?.customer?.address?.[0]?.city || '';
             this.CustomerState = this.RepairObject?.customer?.address?.[0]?.stateCode || '';
             this.CustomerCountry = this.RepairObject?.customer?.address?.[0]?.countryCode || '';
             this.ShipToLocation = this.RepairObject?.account?.assignedShipTo || '';
            this.getLocationData()
            // this.onProductName({ term: '', items: [] });
            this.GetProductCategoryList()
            console.log("OnsiteList ", this.ReservationObject);
          }
        },
        error: (err) => {
          this.ngxSpinnerService.hide()
          console.log(err);
          this.toastMessage.error("Please try again. " + err , "Error", { closeButton: true, disableTimeOut: true })
        }
      })
  };
  
  GetProductCategoryList(){
    
    let category =  this.ReservationObject?.ProductFamily.split(' ')[0]
    
    let requestData =[]
    requestData.push({ Key: "ApiType", Value: "GetProductCategoryList" });
    requestData.push({ Key: "ProductName", Value: category });
    requestData.push({ Key: "SearchTerm", Value: "" });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next(value) {
        
        try {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              console.log("Data is ", data)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                this.ProductName = this.getBlankObject();
                return
              }
              this.ProductList = Array.isArray(data.ProductList?.Product) ? data.ProductList.Product : [ data.ProductList.Product ]   
              
              Object.assign(this.ReservationObject, { ProductFamily: this.ProductList[0].Id });

            }
          } catch (ext) {
            console.log("Excp ", ext)
          }
        },
        error: err => {
          console.log(err)
        }
    })
  }
  
  onProductName($event: { term: String, items: any[] }) {
    let category =  this.ReservationObject?.ProductFamily.split(' ')[0]
    console.log(" Family " ,)
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductName, $event.term==undefined?"":$event.term, {
      ProductCategory: category
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductName = value;
        }
      },
      error: (err) => {
        this.ProductName = this.getBlankObject();
      }
    })
  }


  saveReservation() {
    const validationError = this.validateFields();
    if (validationError) {
      this.toastMessage.error(validationError);
      return;
    }
    
      this.errorMessage = "";
      let requestData = [
        { Key: "ApiType", Value: "SaveReservation" },
        { Key: "ReservationStatus", Value:  "OPEN" },
        { Key: "ReservationType", Value: 'PICKUP' },
        { Key: "CompanyCode", Value: glob.getCompanyCode() },
        { Key: "LocationCode", Value: this.LocationCode || "" },
        { Key: "TimeSlot", Value:"10AM-12PM" },
        { Key: "ProductFamily", Value: this.ReservationObject?.ProductFamily || "" }, // TODO
        { Key: "ProductDescription", Value: this.ReservationObject?.ProductDescription || "" },
        { Key: "SerialNo", Value: this.ReservationObject?.SerialNo || "" },
        { Key: "WarrantyStatus", Value: this.ReservationObject?.WarrantyStatus || "IN-WARRANTY" },
        { Key: "ProblemOrRemark", Value: this.ProblemOrRemark || "" },
        { Key: "CustomerFirstName", Value: this.CustomerFirstName || "" },
        { Key: "CustomerLastName", Value: this.CustomerLastName || "" },
        { Key: "CustomerMobileNo", Value: this.CustomerMobileNo || "" },
        { Key: "CustomerEmailId", Value: this.CustomerEmailId || "" },
        { Key: "CustomerAddressLine1", Value: this.CustomerAddressLine1 || "" },
        { Key: "CustomerAddressLine2", Value: this.CustomerAddressLine2 || "" },
        { Key: "CustomerAddressLine3", Value: this.CustomerAddressLine3 || "" },
        { Key: "CustomerAddressLandmark", Value: this.CustomerAddressLandmark || "" },
        { Key: "CustomerPincode", Value: this.CustomerPincode || "" },
        { Key: "CustomerCity", Value: this.CustomerCity || "" },
        { Key: "CustomerState", Value: this.CustomerState || "" },
        { Key: "CustomerCountry", Value: this.CustomerCountry || "IND" }, 
        { Key: "PaymentMode", Value: this.ReservationObject.PaymentMode || "NA" }, 
        { Key: "Amount", Value: this.ReservationObject.Amount }, 
        { Key: "PaymentTransactionNo", Value: this.ReservationObject.PaymentTransactionNo  }, 
        { Key: "IssueListXml", Value: this.ReservationIssueDetailsXML() },
        { Key: "RepairObject", Value: this.RepairObject ? JSON.stringify(this.RepairObject) : "" },
        { Key: "RepairId", Value: this.RepairObject.repairId},
    ];
      console.log("Before SP ", requestData);
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        content: strRequestData,

      };
      // console.log("Request ", requestData)
      // alert("UAT Testing ")
      // return;
      ;
      this.ngxSpinnerService.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          this.ngxSpinnerService.hide();
          console.log("CustomerValue:", value);
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response?.ExtraData);
            this.toastMessage.success("Reservation Details updated successfully");
            window.location.reload();
          } else {
            this.ngxSpinnerService.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response["errorMessageJson"] = result;
              // this.handleError(response);
            });
          }
        },
        error: (err) => {
          this.ngxSpinnerService.hide();
          console.log(err);
        },
      });
    }
  ReservationIssueDetailsXML() {
      let rawData = {
        "rows": []
      }
      let count = 0;
      this.RepairObject.componentIssues.forEach((item, index) => {
        rawData.rows.push({
          row: {
            ItemNo: index,
            Component: `${item.componentCode} - ${item.componentDescription}`,
            Issue: `${item.issueCode} - ${item.issueDescription}`,
          },
        });
      });
    
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(rawData);
      xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
      xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
      xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
      console.log("Header xml ", xml)
      return xml;
  }
  validateFields() {
    const requiredFields = {
      LocationCode: this.LocationCode,
      CustomerFirstName: this.CustomerFirstName,
      CustomerLastName: this.CustomerLastName,
      CustomerAddressLine1: this.CustomerAddressLine1,
      CustomerCountry: this.CustomerCountry,
      CustomerState: this.CustomerState,
      CustomerCity: this.CustomerCity,
      CustomerPincode: this.CustomerPincode,
      CustomerMobileNo: this.CustomerMobileNo,
      ProductFamily: this.ReservationObject?.ProductFamily,
      ProductDescription: this.ReservationObject?.ProductDescription,
      SerialNo: this.ReservationObject?.SerialNo,
      WarrantyStatus: this.ReservationObject?.WarrantyStatus,
    };
  
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        return `The field "${field}" cannot be empty.`;
      }
    }
  
    return null; // No validation errors
  }
  


  getCustomerObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetRtlCustomerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.params.customercode
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
            console.log("Customer Object ", response)
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
      "Key": "APIType",
      "Value": "GetLocationList"
    });
    requestData.push({"Key": "CompanyCode","Value": glob.getCompanyCode()});
    requestData.push({"Key": "LocationName","Value": ''});
    requestData.push({"Key": "LocationCode","Value": ''});
    requestData.push({"Key": "MobileNo","Value": ''});
    requestData.push({"Key": "EmailId","Value": ''});
    requestData.push({"Key": "PageNo","Value": "1"});
    requestData.push({"Key": "PageSize","Value": "10"});
    requestData.push({
      "Key": "SHIP_TO_GSX",
      "Value": this.ShipToLocation
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Ship to Loca ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            
            let response = JSON.parse(Value.toString());
            console.log("Ship to  ", response)
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              let results = []
              if(Array.isArray(data?.LocationList?.Location))
              {
                results = data?.LocationList?.Location
              }
              else
              {
                results.push(data?.LocationList?.Location)
              }
              this.LocationCode = results[0].LocationCode
            }
          } catch (ext) {
            this.toastMessage.success("Error ", ext);
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


  getReservationObject() {
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetReservationObject"
    })
    requestData.push({
      "Key": "ReservationCode",
      "Value": this.params.rc
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.ngxSpinnerService.hide()

          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let dataJSON = JSON.parse(response.ExtraData)
            if (dataJSON.Totalrecords != "0") {
              console.log("Reservation Object", dataJSON)
              let data = dataJSON.Reservation
              this.ReservationObject = data.RESERVATION
              this.retailCustomerCode = data?.RetailCustomerCode
              this.ReservationDocType = data?.ReservationDocType
              this.ApprovalStatus = data?.ApprovalStatus
              this.ReservationStatus = data?.ReservationStatus
              this.ReservationCode = data.ReservationCode
              this.InvoiceCode = data.InvoiceCode
              this.InvoiceGuid = data.InvoiceGuid
              this.CreatedDate = data.CreatedDate
              this.LocationCode = data.LocationCode 
              this.RepairId = data.RepairId != undefined && data.RepairId != '' ? data.RepairId : null
              this.CustomerFirstName=data.CustomerFirstName
              this.CustomerLastName=data.CustomerLastName
              this.CustomerMobileNo=data.CustomerMobileNo
              this.CustomerEmailId=data.CustomerEmailId
              this.CustomerAddressLine1=data.CustomerAddressLine1
              this.CustomerAddressLine2=data.CustomerAddressLine2
              this.CustomerPincode=data.CustomerPincode
              this.CustomerAddressLandmark=data.CustomerAddressLandmark
              this.CustomerCity=data.CustomerCity
              this.CustomerState = data.CustomerState
              this.CustomerCountry = data.CustomerCountry
              this.ProblemOrRemark = data.ProblemOrRemark
              this.CustomerPincode = data.CustomerPincode
              if (this.ReservationObject.PostToApp == null || this.ReservationObject.PostToApp == undefined) {
                this.posttoAppButton = true
              }
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
          this.ngxSpinnerService.hide()
          console.log(err);
        }
      });
  }



  postToApp() {
    

    let reservation = this.ReservationObject

    let issueDetaisList = []
    if (Array.isArray(reservation.ISSUEDETAILS.ISSUE)) {
      reservation.ISSUEDETAILS.ISSUE.forEach(item => {
        issueDetaisList.push({
          ItemNo: item.ItemNo,
          Component: item.Component,
          Issue: item.Issue,
        })
      })
    }
    else {
      let issue = reservation.ISSUEDETAILS.ISSUE
      issueDetaisList.push({
        ItemNo: issue.ItemNo,
        Component: issue.Component,
        Issue: issue.Issue,
      })
    }



    var obj = {
      ReservationCode: reservation.ReservationCode,
      ReservationType: reservation.ReservationType,
      ReservationDate: reservation.ReservationDate,
      ServiceRefNo: reservation.ServiceRefNo,
      customerinfo: {
        CustomerFirstName: reservation.CustomerFirstName,
        CustomerLastName: reservation.CustomerLastName,
        CustomerMobileNo: reservation.CustomerMobileNo,
        CustomerEmailId: reservation.CustomerEmailId,
        CustomerAlternateMobileNo: reservation.CustomerAlternateMobileNo,
        CustomerAddressLine1: reservation.CustomerAddressLine1,
        CustomerAddressLine2: reservation.CustomerAddressLine2,
        CustomerAddressLine3: reservation.CustomerAddressLine3,
        CustomerAddressLandmark: reservation.CustomerAddressLandmark,
        CustomerPincode: reservation.CustomerPincode,
        CustomerState: reservation.CustomerState,
        CustomerCity: reservation.CustomerCity,
        CustomerCountry: reservation.CustomerCountry,
      },
      productinfo: {
        ProductFamily: reservation.ProductFamily,
        ProductDescription: reservation.ProductDescription,
        SerialNo: reservation.SerialNo,
        WarrantyStatus: reservation.WarrantyStatus,
        ProblemOrRemark: reservation.ProblemOrRemark,
        // For loop for Issues
        issueList: issueDetaisList
      },
      paymentinfo: {
        PaymentMode: reservation.PaymentMode,
        Amount: reservation.Amount,
        PaymentTransactionNo: reservation.PaymentTransactionNo,
      },
      TimeSlot: reservation.TimeSlot,
      ReservationStatus: reservation.ReservationStatus,
      LocationCode: reservation.LocationCode,
    };
    console.log("Before post ", obj);
    // alert("Return On")
    // return
    this.ngxSpinnerService.show()
    this.dynamicService.postToEdgistifyDirectly(obj).subscribe(
      {
        next: (value) => {
          ;
          this.ngxSpinnerService.hide();
          let response = JSON.parse(value.toString());
          console.log("AFter post ", response);
          if (response.code == '0') {
            this.toastMessage.success(response.message, "App Posting")
            window.location.reload()
          }
          else {
            this.toastMessage.error(response.message, "App Posting")
          }
        },
        error: err => {
          
          this.ngxSpinnerService.hide();
          console.log(err);
        }
      });
  }

  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }



  onSubmit(status) {
    if (this.LocationCode == null || this.LocationCode == undefined ) {
      this.toastMessage.error("Location cant be empty")
      return
    }

    const validationError = this.validateFields();
    if (validationError) {
      this.toastMessage.error(validationError);
      return;
    }
    
      this.errorMessage = "";
      let requestData = [];
      requestData.push({
        Key: "ApiType",
        Value: "UpdateReservationDetails",
      });  
      requestData.push({
        Key: "ReservationCode",
        Value: this.ReservationCode == null|| this.ReservationCode == undefined ? "" : this.ReservationCode 
      }); 
      requestData.push({
        Key: "CompanyCode",
        Value: glob.getCompanyCode(),
      });
      requestData.push({
        Key: "ProblemOrRemark",
        Value: this.ProblemOrRemark
      });
      
      requestData.push({
        Key: "CustomerCode",
        Value: this.retailCustomerCode,
      });
      requestData.push({
        Key: "LocationCode",
        Value: this.LocationCode == undefined ? "" : this.LocationCode,
      });
      requestData.push({
        Key: "CustomerFirstName",
        Value: this.CustomerFirstName,
      });
      requestData.push({
        Key: "CustomerLastName",
        Value: this.CustomerLastName,
      });
      requestData.push({
        Key: "CustomerAddressLine1",
        Value: this.CustomerAddressLine1
      });
      requestData.push({
        Key: "CustomerAddressLine2",
        Value: this.CustomerAddressLine2
      });
      requestData.push({
        Key: "CustomerAddressLandmark",
        Value: this.CustomerAddressLandmark
      });
      requestData.push({
        Key: "CustomerCountry",
        Value: this.CustomerCountry
      });
      requestData.push({
        Key: "CustomerState",
        Value: this.CustomerState
      });
      requestData.push({
        Key: "CustomerCity",
        Value: this.CustomerCity
      });
      requestData.push({
        Key: "CustomerPincode",
        Value: this.CustomerPincode
      });
   
      requestData.push({
        Key: "CustomerMobileNo",
        Value: this.CustomerMobileNo
      });
          
      requestData.push({
        Key: "ReservationStatus",
        Value: status == '' ? this.ReservationStatus : status
      });
      requestData.push({
        Key: "CustomerEmailId",
        Value: this.CustomerEmailId
      });
      console.log("Before SP ", requestData);
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        content: strRequestData,

      };
      // return;
      ;
      this.ngxSpinnerService.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          this.ngxSpinnerService.hide();
          console.log("CustomerValue:", value);
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response?.ExtraData);
            this.toastMessage.success("Reservation Details updated successfully");
            window.location.reload();
          } 
          else {
            this.ngxSpinnerService.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response["errorMessageJson"] = result;
              // this.handleError(response);
            });
          }
        },
        error: (err) => {
          this.ngxSpinnerService.hide();
          console.log(err);
        },
      });
    }

    getBlankObject(): DropDownValue {
      const ddv = new DropDownValue();
      ddv.TotalRecord = 0;
      ddv.Data = [];
      return ddv;
    }

  // onSubmit() {
  //   const pattern = /^[^\\+\\=@\\-]/;
  //   const htmlpattern = /<(\"[^\"]\"|'[^']'|[^'\">])*>/
  //   if (!pattern.test(this.CustomerFirstName)) {
  //     this.toastMessage.error("FirstName is Invalid")
  //     return;
  //   }
  //   if (!pattern.test(this.CustomerLastName)) {
  //     this.toastMessage.error("LastName is Invalid")
  //     return
  //   }
  //   if (!pattern.test(this.CustomerAddressLine1)) {
  //     this.toastMessage.error("Address Line 1 is Invalid")
  //     return
  //   }
  //   if (!pattern.test(this.CustomerAddressLine2)) {
  //     this.toastMessage.error("Address Line 2 is Invalid")
  //     return
  //   }
  //   if (!pattern.test(this.CustomerCity)) {
  //     this.toastMessage.error("City is Invalid")
  //     return
  //   }
  //   if (htmlpattern.test(this.CustomerFirstName)) {
  //     this.toastMessage.error("FirstName is Invalid")
  //     return
  //   }
  //   if (htmlpattern.test(this.CustomerLastName)) {
  //     this.toastMessage.error("LastName is Invalid")
  //     return
  //   }
  //   if (htmlpattern.test(this.CustomerAddressLine1)) {
  //     this.toastMessage.error("Address Line 1 is Invalid")
  //     return
  //   }
  //   if (htmlpattern.test(this.CustomerAddressLine2)) {
  //     this.toastMessage.error("Address Line 2 is Invalid")
  //     return
  //   }
  //   if (htmlpattern.test(this.CustomerCity)) {
  //     this.toastMessage.error("City is Invalid")
  //     return
  //   }

  //   this.dynamicService.validateAllFormFields(this.customerForm);
  //   if (this.customerForm.valid) {
  //     if (this.customerForm.get("PinCode").value.toString().length > 6) {
  //       this.toastMessage.error("Invalid PinCode")
  //       return;
  //     }



  //     this.errorMessage = "";
  //     let requestData = [];
  //     requestData.push({
  //       Key: "ApiType",
  //       Value: "UpdateReservationDetails",
  //     });
   
  //     requestData.push({
  //       Key: "CompanyCode",
  //       Value: glob.getCompanyCode(),
  //     });
  //     requestData.push({
  //       Key: "CustomerCode",
  //       Value: this.retailCustomerCode,
  //     });
  //     requestData.push({
  //       Key: "LocationCode",
  //       Value: this.LocationCode == undefined ? "" : this.LocationCode,
  //     });
  //     requestData.push({
  //       Key: "CustomerFirstName",
  //       Value: this.CustomerFirstName,
  //     });
  //     requestData.push({
  //       Key: "CustomerLastName",
  //       Value: this.CustomerLastName,
  //     });
  //     requestData.push({
  //       Key: "CustomerAddressLine1",
  //       Value: this.CustomerAddressLine1
  //     });
  //     requestData.push({
  //       Key: "CustomerAddressLine2",
  //       Value: this.CustomerAddressLine2
  //     });
  //     requestData.push({
  //       Key: "CustomerAddressLandmark",
  //       Value: this.CustomerAddressLandmark
  //     });
  //     requestData.push({
  //       Key: "CustomerCountry",
  //       Value: this.CustomerCountry
  //     });
  //     requestData.push({
  //       Key: "CustomerState",
  //       Value: this.CustomerState
  //     });
  //     requestData.push({
  //       Key: "CustomerCity",
  //       Value: this.CustomerCity
  //     });
  //     requestData.push({
  //       Key: "CustomerPincode",
  //       Value: this.CustomerPincode
  //     });
   
  //     requestData.push({
  //       Key: "CustomerMobileNo",
  //       Value: this.CustomerMobileNo
  //     });
     
  //     requestData.push({
  //       Key: "CustomerEmailId",
  //       Value: this.CustomerEmailId
  //     });
  //     console.log("Before SP ", requestData);
  //     let strRequestData = JSON.stringify(requestData);
  //     console.log(strRequestData);
  //     let contentRequest = {
  //       content: strRequestData,

  //     };
  //     return;
  //     ;
  //     this.ngxSpinnerService.show();
  //     this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
  //       next: (value) => {
  //         this.ngxSpinnerService.hide();
  //         console.log("CustomerValue:", value);

  //         let response = JSON.parse(value.toString());
  //         if (response.ReturnCode == "0") {
  //           let data = JSON.parse(response?.ExtraData);
  //           this.AddCustomerData.emit(data.RetailCustomer);
  //           var close = false;
  //           this.closeAddCustomer.emit(close);
  //           this.toastMessage.success("Customer Added Successfully");
  //           this.returnPrevious();
  //         } else {
  //           this.ngxSpinnerService.hide();
  //           this.errorMessage = response.ReturnMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString(response.ErrorMessage, (err, result) => {
  //             response["errorMessageJson"] = result;
  //             this.handleError(response);
  //           });
  //         }
  //       },
  //       error: (err) => {
  //         this.ngxSpinnerService.hide();
  //         console.log(err);
  //       },
  //     });
  //   }
  //   else {
  //     console.log("Invalid Form ", this.customerForm);

  //     Object.keys(this.customerForm.controls).forEach(key => {
  //       const control = this.customerForm.get(key);
  //       if (control.invalid) {
  //         Object.keys(control.errors).forEach(errorKey => {
  //           let errorMessage = "";
  //           switch (errorKey) {
  //             case 'maxlength':
  //               errorMessage = `${key} exceeds the maximum length of ${control.errors.maxlength.requiredLength}.`;
  //               break;
  //             case 'minlength':
  //               errorMessage = `${key} does not meet the minimum length of ${control.errors.minlength.requiredLength}.`;
  //               break;
  //             case 'pattern':
  //               errorMessage = `${key} does not match the expected pattern: ${control.errors.pattern.requiredPattern}.`;
  //               break;
          
  //           }
  //           errorMessage != "" ? this.toastMessage.error(errorMessage) : ''
  //         });
  //       }
  //     });

  //     console.log("Error in valid");
  //   }


  // }

  // getErrorMessage(control: string): string {
  //   let formControl = this.customerForm.controls[control];
  //   if (formControl.valid) {
  //     return "";
  //   } else {
  //     console.log(formControl.errors);
  //     return formControl.errors?.Message;
  //   }
  // }

  // handleError(response: any) {
    

  //   console.log(response.errorMessageJson.ERRORLIST.ERRORMESSAGE);
  //   for (let error of response.errorMessageJson.ERRORLIST.ERRORMESSAGE) {
  //     let controlName = "";
  //     switch (error.FIELDNAME[0]) {
  //       case "MobileNo":
  //         controlName = "PhoneNo";
  //         break;
  //       case "EmailId":
  //         controlName = "EmailId";
  //         break;
      
  //     }
  //     this.customerForm.controls[controlName].setErrors({
  //       Invalid: true,
  //       Message: error.ERRORMESSAGE[0],
  //     });
  //     this.toastMessage.error(error.ERRORMESSAGE[0], "Error", {
  //       closeButton: true,
  //       disableTimeOut: true,
  //     });
  //   }
  // }



}