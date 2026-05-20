import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, MinLengthValidator, Validators} from "@angular/forms";
import xml2js from "xml2js";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { Filter } from "src/app/custom-components/call-login-dashboard/filter.meta";
import { Observable, BehaviorSubject, first } from "rxjs";
import * as glob from "src/app/config/global";
import { ToastrService } from 'ngx-toastr';
import { DropDownValue,DropdownDataService } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { FixedSizeVirtualScrollStrategy } from "@angular/cdk/scrolling";


@Component({
  selector: 'app-direct-sales',
  templateUrl: './direct-sales.component.html',
  styleUrls: ['./direct-sales.component.css']
})
export class DirectSalesComponent implements OnInit {
  tokenData: any;
  showCustomerVar: boolean = false;
  isAddCustomerShow: boolean = false
  customerCode: any;
  locationCode:string = ''
  showCustomerAddBool: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private route: Router,
    private ngxSpinnerService: NgxSpinnerService
  ) { }

  searchedMobileNumber:number = 0;
  mobNumberPattern = "^((\\+91-?)|0)?[0-9]{10}$"; 
  isSearchButton: boolean = false;
  showAddCustomer:boolean = false;
  errorMessage: any;
  isCustomerDetail: boolean = false;
  isSearched: boolean = false;
  firstName:string = ''
  lastName:string = ''
  emailId:string = ''
  mobileNumber:string = ''
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  typeSelected = 'ball-clip-rotate';
  isPageChanges: boolean = false;

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
  }


  
  search() {
    this.GetCustomerList(this.searchedMobileNumber);
  }

  navigatetoAccessorySales() {
    if(this.locationCode == null || this.locationCode == undefined || this.locationCode == '')
    {
      this.toaster.error("Please select Location")
      return
    }
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { doctype: "DSALES", locationcode: this.locationCode, customercode: this.customerCode } })
  }
  

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
  }
});
  }

  GetCustomerList(mobileNo) {
    let requestData = [];
      requestData.push({
        Key: "APIType",
        Value: "GetCustomerList4Job",
      });
      requestData.push({
        Key: "CompanyCode",
        Value: glob.getCompanyCode(),
      });
      requestData.push({
        Key: "MobileNo",
        Value: mobileNo,
      });
      requestData.push({
        Key: "PageNo",
        Value: "1",
      });
      requestData.push({
        Key: "PageSize",
        Value: "10",
      })
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        content: strRequestData,
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response?.ExtraData);
            if(data.Totalrecords == 1)
            {
              this.toaster.success("Customer Data Found")
              this.isCustomerDetail = true;
              this.showCustomerVar = true
              this.tokenData = data?.CustomerList?.Customer
              this.customerCode = this.tokenData?.CustomerCode
              this.isSearched = false;
              this.firstName = this.tokenData.FirstName
              this.lastName = this.tokenData.LastName
              this.emailId = this.tokenData.EmailID
              this.mobileNumber = this.tokenData.MobileNo
            }
            else{
              this.isCustomerDetail = false;
              this.isSearched = false;
              this.showCustomerVar = false
              this.showAddCustomer = true
            }
          } else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response["errorMessageJson"] = result;
              this.isPageChanges == true;
            });
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }


  addCustomer()
  {
    this.showCustomerAddBool = true
  }


  searchButtonShow($event){
    let mobLength = String($event)
    if(mobLength.length == 10 ){
      this.isSearchButton = true
      this.toaster.success("Success")
    }else{
      this.isSearchButton = false
      this.firstName = ''
      this.lastName = ''
      this.emailId = ''
      this.mobileNumber = ''
      this.showCustomerVar = false
      this.showAddCustomer = false
    }
    
  }

  closeAddCustomer($event) {
    this.showCustomerAddBool = $event
  }


  ClosePopUp() {
    this.showCustomerAddBool = true;
  }
}
