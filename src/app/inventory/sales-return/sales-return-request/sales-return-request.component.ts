import { Component, NgModule, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { lastValueFrom } from 'rxjs';
import { RemarkListComponent } from '../../refund-order/remark-list/remark-list.component';

@Component({
  selector: 'app-sales-return-request',
  templateUrl: './sales-return-request.component.html',
  styleUrls: ['./sales-return-request.component.css']
})
export class SalesReturnRequestComponent implements OnInit, OnChanges {

  @NgModule({
    imports: [
      RemarkListComponent,
      // other imports
    ],
  })

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
  RequestCode: string;
  caseGuid: any;
  caseId: string;
  SalesReturnDocTypeData: string = ''
  retailCustomerCode: any;
  SalesReturnObject: any;
  isEdit: boolean = false;
  approverUser: string = '';
  isnotApprover: boolean = true;

  LocationDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceCode: string = ''
  InvoiceGuid: string = ''
  results:any[] = []
  ApprovalStatus : string;
  SalesReturnStatus : string;
  isApprover = false;

  // File Upload
  isImageUpload = false
  FileUploadList: any[] =[]

  // PopUp Variables:-
  SelectedList: any[] =[];
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
  Spinner= false;
  private spinnerName = 'globalSpinner'; 

  // Remarks Part
  isRemarkUpload= false;
  RemarkLevel: number;
  RemarkUploadList: any[] =[]; // Remark in request is object and in Approval is List
  // Refund Part:- 
  RefundGUID: string
  RefundControl: string;
  RefundControlDD = ['Replacement', 'Refund']
  RefundReason: string
  RefundReasonDD: DropDownValue = DropDownValue.getBlankObject();
  // RefundReasonDD = ['Product Defective', 'Wrong Entry (Product mismatch/Price Mismatch/Customer details wrong,updation)', 'Customer Refused Order']
  StorageCondition: string;
  StorageConditionDD = ['Good', 'Defective']
  submitClicked= false;


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
    this.SalesReturnGUID = uuidv4()
    // Remark Part
    this.RemarkLevel = 0
    this.RemarkUploadList= new Array(1)
    this.RemarkUploadList[0] = {
      RemarkLevel: 'Request Remark',
      RemarkDescription: '',
      RemarkDate: new Date(),
      isEdit: true
    };

    if (Object.keys(this.params).length == 0) {
      // console.log("Params are ",this.params))
      // this.toastMessage.info("Please select Location and Invoice Code")
    }
    else{
      if (this.params.customercode != null && this.params.customercode != undefined) {
        this.getCustomerObject()
      }
      else {
        this.toastMessage.error("Customer Details Not found")
      }
  
      if (this.params.locationcode != null && this.params.locationcode != undefined) {
        this.LocationCode = this.params.locationcode
        this.getLocationData()
      }
      else {
        this.toastMessage.error("Location Details not found")
      }
      if (this.params.invoiceguid != null && this.params.invoiceguid != undefined) {
        this.getInvoiceObject()
      }
      else {
        this.toastMessage.error("Invoice Not found")
        this.location.back()
      }
      const allowedParams = ['customercode', 'locationcode', 'invoiceguid'];
      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }
    }
    this.getApprovalSettingDetailObject()
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
      "Value": this.params.locationcode == null || this.params.locationcode == undefined ? this.LocationCode : this.params.locationcode
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
  SearchInvoiceList(){
    if ( !this.LocationCode ) {
      this.toastMessage.error("Please Select Location")
      return;
    }
    else if (!this.InvoiceCode){
      this.toastMessage.error("Please Enter Invoice Code")
      return
    }
    else{
      this.GetInvoiceList()
      // this.getInvoiceObject()
    }
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

  GetInvoiceList() {
    this.ngxSpinnerService.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetSalesReturnList"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined?"":this.LocationCode
    });
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined?"":this.InvoiceCode
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
          this.ngxSpinnerService.hide()
          this.results = []
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              // console.log("invoice Details ", data)
              if(data?.Totalrecords < 1)
              {
                this.toastMessage.info("No Record Found")
                return
              }
              this.route.navigate(['auth/' + glob.getCompanyCode() + '/sales-return-request'], { queryParams: { locationcode: data.InvoiceObject.LocationCode, customercode: data.InvoiceObject.RetailCustomerCode, invoiceguid: data.InvoiceObject.InvoiceGuid } })
            }
            else{
              this.toastMessage.error("No Data Found")
            }
          } catch (ext) {
            this.ngxSpinnerService.hide()
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
            // console.log("Invice Data", data)
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
                // this.route.navigate(["/auth/" + glob.getCompanyCode() + "/sales-return-list"]);
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
              this.onRefundReasonSearch({ term: "", item: [] })
              // console.log("Pop Object ", this.popUpArray)
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


  showItem(item): Boolean{
    if(this.showOnlySelected == false){
      if(item.isSelected == true){
        return true
      }
      else{
        return false
      }
    }
    else{
      if(item.isSelected == true){
        return true
      }
      else{
        return false
      }
    }
  }

  showAddParts(){
    this.hidePopup = !this.hidePopup;
    if (this.finalSelectedElements.length != 0){
      this.popUpArray.forEach((item) => item.isSelected = false);
    }
  }
  hideAddParts(){
    this.hidePopup = !this.hidePopup;
    this.totalSelectedTaxableAmount = 0;
    this.totalSelectedTaxAmount = 0;
    this.totalSelectedNetAmount = 0;
    this.SelectedList.forEach((item) => {
      item.isSelected = false;
      this.popUpArray.push(item);
    });
    
    this.SelectedList = [];
  }

  UpdateSelectedCount(item){
    let index = this.popUpArray.indexOf(item)
    // console.log("Index selected ", index)

    if (  item.isSelected ) {
      this.popUpArray[index].isSelected = true
      this.SelectedList.push(this.popUpArray[index]);
    }
    else{
      const selected = this.SelectedList.indexOf(item);
      this.SelectedList.splice(selected, 1);
      this.popUpArray[index].isSelected = false;
    } 
    // console.log("Selected Indexes", this.SelectedList)
    this.TotalSelectedNetAmount()
  
  }

  onPopUpSubmit(){
    // console.log("Pop Up Length", this.popUpArray.length)
    // console.log("Final Selected: ", this.finalSelectedElements)
    if(this.SelectedList.length == 0 ){
      this.toastMessage.error("No Payment Selected")
    }
    else{
      for ( let item of this.SelectedList ){
          let index = this.popUpArray.indexOf(item)
          this.popUpArray[index].isSelected = false;
          this.finalSelectedElements.push(this.popUpArray[index]);
          this.popUpArray.splice(index,1)
          // console.log("For loop popup", this.popUpArray)
      }
      console.log("Reason ", this.RefundReason)
      this.RefundReason == 'PD' ? this.finalSelectedElements.forEach(item => {item.StorageCondition = 'Defective';  }) :  this.finalSelectedElements.forEach(item => {item.StorageCondition = 'Good';  })
      this.totalSelectedTaxableAmount = 0;
      this.totalSelectedTaxAmount = 0;
      this.totalSelectedNetAmount = 0;
      
      this.TotalNetAmount();
      this.SelectedList =[];
      this.hidePopup = true;
      this.toastMessage.success("Part/s added successfully");
      // console.log("Final Selected: ", this.finalSelectedElements)
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    console.log("Changes: ", changes)
    if (changes.RefundReason && changes.RefundReason.currentValue == 'PR') {
      // Loop through the finalSelectedElements array and set the StorageCondition to 'Defective'
      this.finalSelectedElements.forEach(item => {
        item.StorageCondition = 'Defective';
      });
    }
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
  
  TotalSelectedNetAmount() {
    this.totalSelectedBaseAmount = 0;
    this.totalSelectedDiscountAmount = 0;
    this.totalSelectedNetAmount = 0;
    this.totalSelectedTaxAmount = 0;
    this.totalSelectedTaxableAmount = 0;
    this.SelectedList.forEach((item) => {
      this.totalSelectedTaxableAmount += parseFloat(item.TaxableAmount);
      this.totalSelectedTaxAmount+= parseFloat(item.TaxAmount); 
      this.totalSelectedNetAmount += parseFloat(item.NetAmount);
      this.totalSelectedDiscountAmount += parseFloat(item.DiscountAmount);
      this.totalSelectedBaseAmount += parseFloat(item.BaseAmount);
    });
    this.totalSelectedTaxableAmount = parseFloat(this.totalSelectedTaxableAmount.toFixed(2));
    this.totalSelectedTaxAmount = parseFloat(this.totalSelectedTaxAmount.toFixed(2));
    this.totalSelectedNetAmount = parseFloat(this.totalSelectedNetAmount.toFixed(2));
    this.totalSelectedDiscountAmount = parseFloat(this.totalSelectedDiscountAmount.toFixed(2));
    this.totalSelectedBaseAmount = parseFloat(this.totalSelectedBaseAmount.toFixed(2));
  }

  deleteitem(item) {
    this.popUpArray.push(item);
    let index = this.finalSelectedElements.indexOf(item)
    this.finalSelectedElements.splice(index, 1)
    this.TotalNetAmount()

    // console.log("Pop Up Array", this.popUpArray)
    // console.log("Final Selected: ", this.finalSelectedElements)
  }
    


  async onSaveRequest( ) {


    // Validations 
    if ( this.isApprover ){
      this.toastMessage.error("Approvers can't create a Sales Return Request")
      return;
    }
    if (this.finalSelectedElements.length == 0) {
      this.toastMessage.error("No parts added")
      return;
    }
    if (this.RefundControl == null || this.RefundControl == undefined || this.RefundControl == '') {
      this.toastMessage.error("Select Refund Control")
      return;
    }
    if (this.RefundReason == null || this.RefundReason == undefined || this.RefundReason == '') {
      this.toastMessage.error("Select Refund Reason")
      return;
    }
    const hasBlankMaterialName = this.finalSelectedElements.some(item => item.ItemDescription == null || item?.ItemDescription === '' || item?.ItemDescription == undefined);
    if (hasBlankMaterialName) {
      this.toastMessage.error("Material Name Not Found...")
      return;
    }
    const hasBlankGSTGroup = this.finalSelectedElements.some(item => item.GSTGroupCode == null || item.GSTGroupCode === '' || item.GSTGroupCode == undefined);
    if (hasBlankGSTGroup) {
      this.toastMessage.error("GST Detail Not found")
      return;
    }
    const hasBlankGSTAmount = this.finalSelectedElements.some(item => item.GSTPercentage == 0);
    if (hasBlankGSTAmount) {
      this.toastMessage.error("GST is not configured for item")
      return;
    }
    const storageCondition = this.finalSelectedElements.some(item => item.StorageCondition == '' || item.StorageCondition == null || item.StorageCondition == undefined);
    if (storageCondition) {
      this.toastMessage.error("Select Storage Condition for every part")
      return;
    }
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    
    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true 

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveSalesReturnRequest"
    })
    requestData.push({
      "Key": "SalesReturnGUID",
      "Value": this.SalesReturnGUID
    })
    requestData.push({
      "Key": "RequestCode",
      "Value": this.RequestCode == null || this.RequestCode == undefined ? '' : this.RequestCode
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "SalesReturnDocType",
      "Value": this.SalesReturnDocTypeData
    })   
    requestData.push({
      "Key": "ApprovalStatus",
      "Value": 'SENT FOR APPROVAL'
    })
    requestData.push({
      "Key": "SalesReturnStatus",
      "Value": 'NA'
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? "" : this.LocationCode
    })
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.caseGuid == null || this.caseGuid == undefined ? "00000000-0000-0000-0000-000000000000" : this.caseGuid
    })
    requestData.push({
      "Key": "CaseId",
      "Value": this.caseId == null || this.caseId == undefined ? "" : this.caseId
    })
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.InvoiceGuid
    })
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.InvoiceCode
    })
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.retailCustomerCode == null || this.retailCustomerCode == undefined ? "" : this.retailCustomerCode
    })
    requestData.push({
      "Key": "TotalBaseAmount",
      "Value": this.totalBaseAmount
    });
    requestData.push({
      "Key": "TotalDiscountAmount",
      "Value": this.totalDiscountAmount
    });
    requestData.push({
      "Key": "TotalTaxableAmount",
      "Value": this.totalTaxableAmount
    });
    requestData.push({
      "Key": "TotalTaxAmount",
      "Value": this.totalTaxAmount
    });
    requestData.push({
      "Key": "TotalNetAmount",
      "Value": this.totalNetAmount
    });
    requestData.push({
      "Key": "SalesReturnRemark",
      "Value": this.RemarkUploadList[0].RemarkDescription
    });
    requestData.push({
      "Key": "RefundControl",
      "Value": this.RefundControl
    });
    requestData.push({
      "Key": "RefundReason",
      "Value": this.RefundReason
    });
    requestData.push({
      "Key": "SalesReturnRequestDetail",
      "Value": this.saveSalesReturnXML()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Sale Request", requestData)
    
    // // // TODO:- 
    // // await this.SaveFiles();
    // return
    this.showSpinner();
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log("Request ", response)
            let ExtraData = JSON.parse(response.ExtraData);
            this.SaveFiles();
          }
          else {
            this.submitClicked = false
            this.hideSpinner()
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
          this.hideSpinner()
          this.submitClicked = false
          // this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });
  }

  onRefundReasonSearch($event: { term: string; item: any[] } ) {
    let Reason = this.RefundReason
    // console.log("onRefundDocTypeSearch:- " , this.RefundDocType , "\n")
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundReason, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
      RefundReason: ''
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log("Reason DD ", value )
          this.RefundReasonDD = value;
          // // Set the Refund Doc type
          // const refundType = this.RefundAgainstDD.Data.find(item =>item.Id == DocType)
          // if(refundType){
          //   this.RefundDocType = refundType.Id;
          //   this.RefundAgainst = refundType.TEXT;
          // }
        }
      },
      error: (err) => {
        this.RefundReasonDD = DropDownValue.getBlankObject();
      }
    });
  }

  async getApprovalSettingDetailObject() {
    // let timeout = 0;
    // // Wait till LocationCode or isApproverL1 is not empty 
    // this.ngxSpinnerService.show()
    // while (  !this.LocationCode || (this.isApproverL1 == undefined || this.isApproverL1 == null) ) {
    //   // Wait for 1 sec before checking again
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   timeout += 1000;
    //   // Set a timeout of 10 seconds (10,000 milliseconds)
    //   if (timeout == 10000) {
    //     this.toastMessage.error("Error: Timeout occurred while waiting for Location Code");
    //     this.route.navigate(['/auth/' + glob.getCompanyCode() + '/sales-return-list'])
    //     break;
    //   }
    // }
    // this.ngxSpinnerService.hide()


    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "SalesReturnApproval"
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    let userName  = glob.getLogedInUser().UserDetails.UserName;
    // console.log("Before Approval Sp", userName)
    // console.log("Before Approval Sp", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
           console.log("Approval Object Response", response)
          if (response.ReturnCode == '0') {
            let extraDataResponse = JSON.parse(response?.ExtraData);
            if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == userName ) {
              this.isApprover = true
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


  saveSalesReturnXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.finalSelectedElements) {
      count += 1
      rawData.rows.push({
        "row": {
          "SalesReturnDetailGuid": item.SalesReturnDetailGuid == null || item.SalesReturnDetailGuid == undefined ? uuidv4() : item.SalesReturnDetailGuid,
          "SalesReturnGUID": this.SalesReturnGUID,
          "InvoiceGUID": item.InvoiceGUID ,
          "InvoiceDetailGuid": item.InvoiceDetailGuid,
          "ItemType": item.ItemType,
          "DivisionCode": item.DivisionCode == null || item.DivisionCode == undefined ? "" : item.DivisionCode,
          "SalesUOM": item.SalesUOM == null || item.SalesUOM == undefined ? "" : item.SalesUOM,
          "ItemNo": count,
          "OriginalItemNo": item.ItemNo == undefined || item.ItemNo == null ? 0 : item.ItemNo,
          "SerialNo": item.SerialNo == undefined || item.SerialNo == null ? "" : item.SerialNo,
          "ItemCode": item.ItemCode == undefined || item.ItemCode == null ? "" : item.ItemCode,
          "ItemDescription": item.ItemDescription == undefined || item.ItemDescription == null ? "" : item.ItemDescription,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
          "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
          "Quantity": item.Quantity == null || item.Quantity == undefined ? "0" : item.Quantity,
          "UnitPrice": item.UnitPrice,
          "BaseAmount": item.BaseAmount,
          "DiscountAmount": item.DiscountAmount,
          "TaxableAmount": item.TaxableAmount,
          "TaxPercentage": item.TaxPercentage,
          "CGSTPercentage": item.CGSTPercentage,
          "SGSTPercentage": item.SGSTPercentage,
          "IGSTPercentage": item.IGSTPercentage,
          "LavyPercentage": item.LavyPercentage == null || item.LavyPercentage == undefined ? 0 : item.LavyPercentage,
          "CGSTAmount": item.CGSTAmount,
          "SGSTAmount": item.SGSTAmount,
          "IGSTAmount": item.IGSTAmount,
          "LavyAmount": item.LavyAmount == null || item.LavyAmount == undefined ? 0.00 : item.LavyAmount,
          "NetAmount": item.NetAmount,
          "TaxAmount": item.TaxAmount,
          "Batch": item.Batch == null || item.Batch == undefined ? "" : item.Batch,
          "StorageCondition": item.StorageCondition == null || item.StorageCondition == undefined ? "" : item.StorageCondition,

        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("XML is:- ", xml)
    return xml;
  }


  // FILE UPLOAD PART
 
  Cancel(event){
    this.isImageUpload = false
  }

  onFileListChanged(event){
    this.FileUploadList = event;
    this.isImageUpload = false;
  }
  
  async sendFilesToServer(){
    const uploadPromises = this.FileUploadList.map(async (file) => {
      var ext =  file.filename.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      // let formData = new FormData();
      // formData.append('file', file.AttachmentFile, filename);
      const result = await this.dynamicService.uploadFileToS3Local(file.AttachmentFile, filename)
      file.src = result['dbPath']; // glob.GLOBALVARIABLE.SERVER_LINK + result['dbPath'];
      // console.log("After Upload is :- ",file)
    });
    
    await Promise.all(uploadPromises);
  }

  saveFilesXML() {

    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.FileUploadList) {
      count += 1
      rawData.rows.push({
        "row": {
          "AttachmentGUID": item.AttachmentGUID == null || item.AttachmentGUID == undefined ? uuidv4() : item.AttachmentGUID,
          "FileName": item.filename ,
          "FileType": item.type,
          "CreatedDateTime": item.createdDateTime == null || item.createdDateTime == undefined ? new Date().toISOString() : item.createdDateTime.toISOString(),
          "AttachmentFile": item.src,  
          "CloudFlag" : "1"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("File XML is:- ", xml)
    return xml;
  }

  async SaveFiles(){
    
    let requestData = []
    if (this.SalesReturnGUID == null || this.SalesReturnGUID == undefined) {
      this.toastMessage.error("No Sales Return GUID Found!")
      return
  }
    try{
        await this.sendFilesToServer();
    } 
    catch (error) {
        this.submitClicked= false
        this.toastMessage.error("Error in Uploading Files to Server");
        return;
    }

    requestData.push({
      "Key": "APIType",
      "Value": "SaveTransactionAttachment"
    })
    requestData.push({
      "Key": "TransactionGUID",
      "Value": this.SalesReturnGUID
    })
    requestData.push({
      "Key":  "TransactionDocType",
      "Value": 'SREFUND'
    })
    requestData.push({
      "Key": "FilesXml",
      "Value": this.saveFilesXML()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Transaction File Request", requestData)
    // // TODO:- 
    // return
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked= false
          // this.ngxSpinnerService.hide()
          // console.log("Request ", value)
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            // console.log("ExtarData", ExtraData)
            this.hideSpinner();
            this.toastMessage.success("Successfully submitted the Sales Request")
            this.route.navigate(['auth/' + glob.getCompanyCode() + '/sales-return-list'])
          }
          else {
            this.submitClicked= false
            this.hideSpinner()
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
          this.submitClicked= false
          this.hideSpinner()
          // this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });

  }




  // Remarks Part

  getNonEmptyRemarksCount(): number {
    return this.RemarkUploadList.filter(item => item.RemarkDescription != '').length;
  }

  onRemarkListChanged(event){
    this.RemarkUploadList = event;
    this.isRemarkUpload = false;
  } 

  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }

}