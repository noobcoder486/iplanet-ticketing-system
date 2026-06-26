import { AddCustomerComponent } from '../create-customer/add-customer/add-customer.component';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { ToastrService } from 'ngx-toastr';
import { Filter } from '../call-login-dashboard/filter.meta';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';
import * as glob from "../../config/global";
import { ACTIONENUM } from 'src/app/config/comman.const';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from '../call-login/metadata/request.metadata';
import xml2js from 'xml2js';
import { title } from 'process';


@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})


export class CreateCustomerComponent implements OnInit {
  SelectedCounter;
  selectedLocationCode: string = '';
  email: string = '';
  customercode: string = '';
  customerfirstname: string = '';
  mobilenumber: string = '';
  CustomerCode: string
  VisitPurpose: string;
  VisitPurposeDesc: string;
  Phonenumbersearched = ""
  typeSelected = 'ball-clip-rotate';
  CounterData: any = ['C1', 'C2', 'C3', 'C4', 'C5'];
  EnquiryList: any = [] = []
  showAddCustomer: boolean = false;
  isSelectToken: boolean = false;
  isGridShow: boolean = false;
  isEnquiryGridShow: boolean = false;
  isCustomerView: boolean = false
  isCreateJobShow: boolean = false;
  isAddCustomerShow: boolean = false
  isEnquiryForm: boolean = false;
  isNextBtn: boolean = true;
  isSelectBtn: boolean = true;
  isCloseBtn: boolean = true;
  isNoShowBtn: boolean = true;
  isOtpVerification: boolean = false;
  ReservationCode: string;

  ReferredByDD: DropDownValue = this.getBlankObject();
  ReferredBy: any

  CustomerVisitSourceDD: DropDownValue = this.getBlankObject();
  CustomerVisitSourceSelected: any

  CustomerSourceNameDD: DropDownValue = this.getBlankObject();
  CustomerSourceNameSelected: any


  ButtonValidate() {
    if (this.SelectedCounter != null && this.SelectedCounter != undefined) {
      this.isNextBtn = false;
      this.isSelectBtn = false;
    } else {
      this.isNextBtn = true;
      this.isSelectBtn = true;
      this.Validation()
    }
  }


  OpenCall: number
  pagination: PaginationMetaData;
  jobPagination: PaginationMetaData;
  JobList: any[];
  CustomerObject: any[];
  tokendata: any = [];
  reservationData: any
  searchForm: FormGroup;
  JobColumns: Columns[] = [];
  JobColumnsEnquiry: Columns[] = [];
  toolBarAction: any[] = [];
  actionDetails: any[] = [];
  selectedCallForm: any;
  currentStatus;
  TokenFirstName;
  emailID;
  TokenLastName;
  TokenNumber;
  TokenCreatedDate;
  CounterNumber;
  caseid = "";
  firstname = "";
  phonenumber = "";
  Emailid = "";
  Serialno = "";
  callType: any;
  JobStatustype: any;
  errorMessage: any;
  params
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  @Input() filters: Observable<Filter[]>;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobDetailEnquriy: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  VisitPurposeDropDown: DropDownValue = DropDownValue.getBlankObject();



  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private toastmeassge: ToastrService,
    private ngxSpinner: NgxSpinnerService,
    private modalService: NgbModal,
    private ngxservice: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
  ) {
    this.pagination = new PaginationMetaData();
    this.activatedRoute.data.subscribe((data: any) => {
      this.jobPagination = new PaginationMetaData();
      this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    })
  }

  ngOnInit() {

    // this.OnCustomerSourceName({ term: "", item: [] });
    this.OnCustomerVisitSource({ term: "", items: [] });
    //  this.onReferredBy({ term: "", items: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.mb && this.params.mb != '') {
      this.mobilenumber = this.params.mb;
      if (this.params.rc && this.params.rc != '') {
        this.ReservationCode = this.params.rc
        this.getReservationObject()
      }
      // this.GetCustomerList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
      // this.getEnquiryList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
      // this.TokenFirstName = this.tokendata.FirstName;
      // this.TokenLastName = this.tokendata.LastName;
      // this.VisitPurpose = this.tokendata.VisitPurposeDesc
      // if (this.TokenNumber != null && this.TokenNumber != undefined) {
      //   this.isNextBtn = true;
      //   this.isSelectBtn = true;
      //   this.isCloseBtn = false;
      //   this.isNoShowBtn = false;
      // }
    }

    this.injobTable();
    this.injobTableEnquiry();
    this.CustomerObject = []
    this.onLocationSearch({ term: "", item: [] });
    this.onVisitPurpose({ term: "", items: [] });
  }

  onVisitPurpose($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.VisitPurpose, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.VisitPurposeDropDown = value;
          }
        },
        error: (err) => {
          this.VisitPurposeDropDown = this.getBlankObject();
        },
      });
  }

  open() {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'xl' });
  }


  jobLoadPageData(details) {
    setTimeout(() => { this.jobListHideSpinnerEvent.next(); }, 1);
  }


  search() {
    this.GetCustomerList(this.customercode, this.customerfirstname, this.mobilenumber, this.email);
  }


  getReservationObject() {
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetReservationObject"
    })
    requestData.push({
      "Key": "ReservationCode",
      "Value": this.ReservationCode
    })
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
            if (data.Totalrecords != "0") {
              console.log("Reservation Object", data)
              this.reservationData = data.Reservation
            }
            else {
              this.toastmeassge.error("No Reservation Data found")
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


  GetCustomerList(customercode, customerfirstname, phonenumber, email) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerList4Job"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": customercode
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": customerfirstname
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": email
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "GSTNO",
      "Value": ''
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {

          try {
            var isCustomerfound = false;
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              var custlist = [];
              console.log(data?.CustomerList?.Customer)
              if (Array.isArray(data?.CustomerList?.Customer)) {
                custlist.push(data?.CustomerList?.Customer[0]);
                this.CustomerObject = custlist
                isCustomerfound = true;
              }
              else {
                if (!(data?.CustomerList?.Customer == null || data?.CustomerList?.Customer == undefined)) {
                  custlist.push(data?.CustomerList?.Customer);
                  isCustomerfound = true;
                }
                else {
                  isCustomerfound = false;
                }
              }
              if (isCustomerfound == true) {
                this.CustomerCode = custlist[0].CustomerCode
                this.phonenumber = custlist[0].MobileNo
                this.OpenCall = custlist[0].OPENCalls
                this.getEnquiryList(this.CustomerCode, this.customerfirstname, this.phonenumber, this.email);
                this.getJobDetail(this.caseid, this.firstname, this.phonenumber, this.Emailid, this.Serialno, this.callType, this.JobStatustype);
                this.CustomerObject = custlist
                this.isCreateJobShow = true
                if (this.OpenCall != null && this.OpenCall != undefined && this.OpenCall != 0) {
                  this.isGridShow = true
                }
                this.isCustomerView = true
              }
              if (this.CustomerCode == null || this.CustomerCode == undefined || isCustomerfound == false) {
                this.toastmeassge.info("No Customer Found for this Mobile No, Kindly create one")
                this.showAddCustomer = true;
                this.CustomerObject = []
                this.isCreateJobShow = false;
              }
              if (this.errorMessage == 'Already Serving') {
                this.isCustomerView = false
                this.isGridShow = false
              }
              this.errorMessage = " "

            }
          } catch (ext) {
          }
        },
        error: err => {
          console.log(err)
          this.isCreateJobShow = false;
        }

      }
    );
  }


  navigatetoAccessorySales() {
    //   if(this.ReferredBy == null || this.ReferredBy == undefined || this.ReferredBy == ''){
    //   this.toastmeassge.error("Please Select Referred By");
    //   return
    // }
    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    this.UpdateReferredByInToken()
    let customercode = ''
    for (let item of this.CustomerObject) {
      customercode = item.CustomerCode
    }
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { doctype: "DSALES", locationcode: this.selectedLocationCode, customercode: customercode, CVS: this.CustomerVisitSourceSelected, CSN: this.CustomerSourceNameSelected } })
  }

  // AMC SALES
  navigatetoAMCSales() {

    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    this.UpdateReferredByInToken()
    let customercode = ''
    for (let item of this.CustomerObject) {
      customercode = item.CustomerCode
    }
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { doctype: "AMCSALES", locationcode: this.selectedLocationCode, customercode: customercode, CVS: this.CustomerVisitSourceSelected, CSN: this.CustomerSourceNameSelected } })
  }



  createServiceNonRepairJob() {
    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    this.UpdateReferredByInToken()
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { doctype: 'snr', cc: glob.getCompanyCode(), nc: this.CustomerCode, tc: this.TokenNumber, td: this.TokenCreatedDate, cn: this.CounterNumber, lc: this.selectedLocationCode, CVS: this.CustomerVisitSourceSelected, CSN: this.CustomerSourceNameSelected } })
  }


  createNewJobWithout() {
    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    this.UpdateReferredByInToken()
    if (!this.params.mb) {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { doctype: 'oth', rc: this.params.rc, cc: glob.getCompanyCode(), nc: this.CustomerCode, tc: this.TokenNumber, td: this.TokenCreatedDate, cn: this.CounterNumber, lc: this.selectedLocationCode, CVS: this.CustomerVisitSourceSelected, CSN: this.CustomerSourceNameSelected } })
    }
    else {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { doctype: 'oth', cc: glob.getCompanyCode(), nc: this.CustomerCode, rc: this.params.rc, lc: this.params.locationcode, CVS: this.CustomerVisitSourceSelected, CSN: this.CustomerSourceNameSelected } })
    }

    // this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: {  doctype: 'oth' ,  rc :this.params.rc, cc: glob.getCompanyCode(), nc: this.CustomerCode, tc: this.TokenNumber, td: this.TokenCreatedDate, cn: this.CounterNumber, lc: this.selectedLocationCode } })
  }



  loadPageData() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetNextToken"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationCode
    });
    requestData.push({
      "Key": "Counter",
      "Value": this.SelectedCounter
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
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.tokendata = data.Token;
              console.log("TOk", this.tokendata)
              this.mobilenumber = this.tokendata.MobileNo;
              this.emailID = this.tokendata.EmailId
              this.TokenNumber = this.tokendata.TokenCode;
              this.TokenCreatedDate = this.tokendata.TokenDate;
              this.CounterNumber = this.tokendata.Counter
              this.GetCustomerList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
              this.getEnquiryList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
              this.TokenFirstName = this.tokendata.FirstName;
              this.TokenLastName = this.tokendata.LastName;
              this.VisitPurpose = this.tokendata?.VisitPurpose
              this.VisitPurposeDesc = this.tokendata?.VisitPurposeDesc
              if (this.TokenNumber != null && this.TokenNumber != undefined) {
                this.isNextBtn = true;
                this.isSelectBtn = true;
                this.isCloseBtn = false;
                this.isNoShowBtn = false;
              }
            }
          }
          catch (ext) {
            this.Validation();
            this.toastmeassge.error("Please Create Token First")
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }


  SelectedTokenData() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SetSelectedToken"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationCode
    });
    requestData.push({
      "Key": "Counter",
      "Value": this.SelectedCounter
    });
    requestData.push({
      "Key": "TokenCode",
      "Value": this.TokenNumber
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
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);

            this.tokendata = data.Token;
            console.log("TOk", this.tokendata)
            this.mobilenumber = this.tokendata.MobileNo;
            this.emailID = this.tokendata.EmailId
            this.TokenNumber = this.tokendata.TokenCode;
            this.GetCustomerList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
            this.getEnquiryList(this.customercode, this.customerfirstname, this.mobilenumber, this.email);
            this.TokenFirstName = this.tokendata.FirstName;
            this.TokenLastName = this.tokendata.LastName;
            if (this.TokenNumber != null && this.TokenNumber != undefined) {
              this.isNextBtn = true;
              this.isSelectBtn = true;
              this.isCloseBtn = false;
              this.isNoShowBtn = false;
            }
            this.VisitPurpose = this.tokendata.VisitPurpose
          } else {
            this.errorMessage = response.ReturnMessage;
            this.TokenFirstName = " "
            this.TokenLastName = " "
            this.VisitPurpose = " "
            this.TokenNumber = " "
            this.isCustomerView = false;
            this.isGridShow = false;
            this.isCreateJobShow = false;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.toastmeassge.error(this.errorMessage)
            });
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          this.selectedLocationCode = this.LocationForJob.Data[0].Id
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }


  customeradded($event) {
    console.log("Data", $event)
    this.isCreateJobShow = true;
    this.CustomerCode = $event.CustomerCode
    this.CustomerObject.push($event)
    this.showAddCustomer = false;
    this.isCustomerView = true
  }

  TokenStatusChange(tokenstatus: string) {
    if (this.selectedLocationCode == '' || this.selectedLocationCode == null || this.selectedLocationCode == undefined) {
      this.toastmeassge.error("Location not Selected")
      return;
    }
    let RequestStatus = [];
    RequestStatus.push({
      "Key": "APIType",
      "Value": "SaveTokenStatus"
    });
    RequestStatus.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    RequestStatus.push({
      "Key": "TokenCode",
      "Value": this.tokendata.TokenCode
    });
    RequestStatus.push({
      "Key": "TokenStatus",
      "Value": tokenstatus
    });
    RequestStatus.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationCode
    });
    let requestdataObj = JSON.stringify(RequestStatus);
    let requstDataStringfy =
    {
      "content": requestdataObj
    }
    this.dynamicService.getDynamicDetaildata(requstDataStringfy).subscribe(
      {
        next: (Value) => {
        }
      })
  }


  HoldToken() {
    if (this.selectedLocationCode == '' || this.selectedLocationCode == null || this.selectedLocationCode == undefined) {
      this.toastmeassge.error("Location not Selected")
      return;
    }
    this.ngxservice.show
    let RequestStatus = [];
    RequestStatus.push({
      "Key": "APIType",
      "Value": "SaveTokenStatus"
    });
    RequestStatus.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    RequestStatus.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationCode
    });
    RequestStatus.push({
      "Key": "TokenCode",
      "Value": this.tokendata.TokenCode
    });
    RequestStatus.push({
      "Key": "TokenStatus",
      "Value": "HOLD"
    });
    let requestdataObj = JSON.stringify(RequestStatus);
    let requstDataStringfy =
    {
      "content": requestdataObj
    }
    this.dynamicService.getDynamicDetaildata(requstDataStringfy).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          this.ngxservice.hide()
          this.TokenFirstName = null;
          let data = JSON.parse(response.ExtraData)
          console.log("Hold", response)
          this.TokenLastName = null;
          this.TokenNumber = null;
          var closeVariable = 'Close';
          this.currentStatus = closeVariable;
          this.showAddCustomer = false
          this.TokenFirstName = " "
          this.TokenLastName = " "
          this.VisitPurpose = " "
          this.TokenNumber = " "
          this.isCustomerView = false;
          this.isGridShow = false;
          this.isCreateJobShow = false;
          this.isNextBtn = false;
          this.isSelectBtn = false;
          this.isCloseBtn = true;
          this.isNoShowBtn = true;
        },
        error: (err) => {
          console.log(err)
          this.toastmeassge.error(err)
        }
      })
  }


  Validation() {
    if (this.SelectedCounter == '' || this.SelectedCounter == undefined || this.SelectedCounter == undefined) {
      this.toastmeassge.error("Select counter")
      return false
    }
    if (this.selectedLocationCode == '' || this.selectedLocationCode == undefined || this.selectedLocationCode == undefined) {
      this.toastmeassge.error("Select Location Code")
      return false
    }
    return true;
  }

  isAddCustomer() {
    if (this.isAddCustomerShow == true) {
      this.isAddCustomerShow = false;
    } else {
      this.isAddCustomerShow = true;
    }
  }

  NoShowFun() {
    this.TokenFirstName = null;
    this.TokenLastName = null;
    let changeStatus = 'NoShow';
    this.TokenNumber = null;
    this.currentStatus = changeStatus;
    this.TokenStatusChange("NOSHOW");
    this.TokenFirstName = " "
    this.TokenLastName = " "
    this.VisitPurpose = " "
    this.TokenNumber = " "
    this.isCustomerView = false;
    this.isGridShow = false;
    this.isCreateJobShow = false;
    this.isNextBtn = false;
    this.isSelectBtn = false;
    this.isCloseBtn = true;
    this.showAddCustomer = false;
    this.isNoShowBtn = true;
  }


  CloseTokenBtn() {
    this.TokenFirstName = null;
    this.TokenLastName = null;
    this.TokenNumber = null;
    var closeVariable = 'Close';
    this.currentStatus = closeVariable;
    this.TokenStatusChange("CLOSE");
    this.showAddCustomer = false
    this.TokenFirstName = " "
    this.TokenLastName = " "
    this.VisitPurpose = " "
    this.TokenNumber = " "
    this.isCustomerView = false;
    this.isGridShow = false;
    this.isCreateJobShow = false;
    this.isNextBtn = false;
    this.isSelectBtn = false;
    this.isCloseBtn = true;
    this.isNoShowBtn = true;
  }

  ClosePopUp() {
    this.isAddCustomerShow = true;

  }


  Open() {

    console.log('this.TokenNumber', this.TokenNumber)

    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    this.CustomerObject.push({ ReferredBy: '' })
    this.CustomerObject.push({ CustomerVisitSourceSelected: this.CustomerVisitSourceSelected })
    this.CustomerObject.push({ CustomerSourceNameSelected: this.CustomerSourceNameSelected })
    this.CustomerObject.push({ LocationCode: this.selectedLocationCode })
    this.CustomerObject.push({ TokenCode: this.TokenNumber })
    this.UpdateReferredByInToken();
    console.log('CustomerObject', this.CustomerObject);
    this.isEnquiryForm = true;
  }


  injobTable() {
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Case Id", "CaseId"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "First Name", "FirstName"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "MOBILE NO", "MobileNo"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "EmailId", "EmailId"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Serial No", "SerialNo1"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Material Desc", "productDescription"));;
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Remark", "Remark"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Fault Description", "ComplainDesc"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Status", "JobStatus"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Type", "JobType"));
    this.actionDetails.push({ code: 'Repair', icon: 'build_circle', title: 'Repair' });
  }


  injobTableEnquiry() {
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "Customer Code", "CustomerCode"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "First Name", "FirstName"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "Last Name", "LastName"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "MOBILE NO", "MobileNo"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "EmailId", "EmailID"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "Disposition Type", "DispositionType"));
    this.JobColumnsEnquiry.push(this.dynamicService.getColumn("STRING", "Remark", "Remark"));
    this.actionDetails.push({ code: 'Repair', icon: 'build_circle' });
  }


  selectToken() {
    if (this.isSelectToken == true) {
      this.isSelectToken = false;

    } else {
      this.isSelectToken = true;
    }
  }


  TokenObj($event) {
    this.TokenFirstName = $event.FirstName;
    this.TokenLastName = $event.LastName;
    this.VisitPurpose = $event.VisitPurpose
    this.TokenNumber = $event.TokenCode;
    this.mobilenumber = $event.MobileNo;
    this.tokendata = $event
    this.SelectedTokenData()
    this.GetCustomerList(this.customercode, this.customerfirstname, this.mobilenumber, this.email)
    this.getEnquiryList(this.customercode, this.customerfirstname, this.mobilenumber, this.email);

  }


  CloseSelectedToken($event) {
    this.isSelectToken = $event
  }


  getEnquiryList(customercode, customerfirstname, phonenumber, email) {
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetEnquiryLists"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": customercode
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": customerfirstname
    });

    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": email
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "5"
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
              response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
              let EnquiryListData = response?.ExtraDataJSON?.EnquiryList?.Enquiry
              if (EnquiryFindData == undefined || EnquiryFindData == null) {
              }
              else {
                var EnquiryFindData: any = [];
                if (Array.isArray(EnquiryListData)) {
                  EnquiryFindData = EnquiryListData;
                }
                else {
                  EnquiryFindData.push(EnquiryListData)
                }
                this.JobDetailEnquriy.next({ totalRecord: EnquiryListData?.length, Data: EnquiryFindData });
              }
            }
            else {
              this.toastmeassge.error(response)
            }
          } catch (ext) {
            console.log(ext);
            this.EnquiryList = [];
            this.JobDetailEnquriy.next({ totalRecord: this.EnquiryList?.length, Data: this.EnquiryList });
          }
        },
        error: err => {
          console.log(err);
          this.EnquiryList = [];
          this.JobDetailEnquriy.next({ totalRecord: this.EnquiryList?.length, Data: this.EnquiryList });
        }
      }
    );
  }

  SearchCallLogin() {
    this.getJobDetail(this.caseid, this.firstname, this.phonenumber, this.Emailid, this.Serialno, this.callType, this.JobStatustype);
  }


  getJobDetail(caseid, firstname, phonenumber, Emailid, Serialno, callType, JobStatustype) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobDetails"
    });
    requestData.push({
      "Key": "CaseId",
      "Value": caseid
    });
    requestData.push({
      "Key": "SerialNo",
      "Value": Serialno
    });
    requestData.push({
      "Key": "FirstName",
      "Value": firstname
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": this.Emailid
    });
    requestData.push({
      "Key": "JobStatus",
      "Value": JobStatustype
    });
    requestData.push({
      "Key": "JobType",
      "Value": callType
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {

            let response = JSON.parse(Value.toString());

            if (response.ReturnCode == '0') {
              response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
              let jobListData = response['ExtraDataJSON']['JobList']['JobData']
              var JobFindData: any = [];
              if (Array.isArray(jobListData)) {
                JobFindData = jobListData;
              }
              else {
                JobFindData.push(jobListData)
              }
              this.JobDetail.next({ totalRecord: response['ExtraDataJSON']?.Totalrecords, Data: JobFindData });
            }
            else {
              this.toastmeassge.error(response)
            }
          } catch (ext) {
            console.log(ext);
            this.JobList = [];
            this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
          }
        },
        error: err => {

          console.log(err);
          this.JobList = [];
          this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
        }
      }
    );
  }


  // 
  JobListloadPageData(event) {

    console.log('event', event)
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];

        requestData.push({
          "Key": "APIType",
          "Value": "GetJobDetails"
        });
        requestData.push({
          "Key": "CaseId",
          "Value": this.caseid ? this.caseid.trim() : ''
        });
        requestData.push({
          "Key": "SerialNo",
          "Value": ''
        });
        requestData.push({
          "Key": "FirstName",
          "Value": ''
        });
        requestData.push({
          "Key": "MobileNo",
          "Value": this.phonenumber ?? ''
        });
        requestData.push({
          "Key": "EmailId",
          "Value": this.Emailid ?? ''
        });
        requestData.push({
          "Key": "JobStatus",
          "Value": ''
        });
        requestData.push({
          "Key": "JobType",
          "Value": ''
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        });
        requestData.push({
          "Key": "PageNo",
          "Value": event.eventDetail.pageIndex + 1
        });
        requestData.push({
          "Key": "PageSize",
          "Value": event.eventDetail.pageSize
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
                  response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
                  let jobListData = response['ExtraDataJSON']['JobList']['JobData']
                  var JobFindData: any = [];
                  if (Array.isArray(jobListData)) {
                    JobFindData = jobListData;
                  }
                  else {
                    JobFindData.push(jobListData)
                  }
                  this.JobDetail.next({ totalRecord: response['ExtraDataJSON']?.Totalrecords, Data: JobFindData });
                }
                else {
                  this.toastmeassge.error(response)
                }
              } catch (ext) {
                console.log(ext);
                this.JobList = [];
                this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
              }
            },
            error: err => {
              console.log(err);
              this.JobList = [];
              this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
            }
          }
        );
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }
  // 

  createNewJob() {
    this.isOtpVerification = true;
    // this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { cc: glob.getCompanyCode(), nc: this.CustomerCode, tc:this.TokenNumber, td:this.TokenCreatedDate, cn:this.CounterNumber ,lc:this.selectedLocationCode } })
  }


  iscreateJob: boolean = false
  validatedOTP($event) {
    this.iscreateJob = $event
    if (this.iscreateJob = true)
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { cc: glob.getCompanyCode(), nc: this.CustomerCode, tc: this.TokenNumber, td: this.TokenCreatedDate, cn: this.CounterNumber, lc: this.selectedLocationCode } })

  }


  actionEmit(event) {

    switch (event.action) {
      case "ROWSELECT":
        break;
      case "Delete":
        break;
      case "Repair":
        this.UpdateReferredByInToken()
        this.route.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: event.row.CaseGUID, tc: this.TokenNumber, vp: this.VisitPurpose } });
        break;
    }
  }


  closeAddCustomer($event) {
    this.isAddCustomerShow = $event
  }


  CloseEvent($event) {
    this.isEnquiryForm = false
    window.location.reload()
    this.isEnquiryForm = $event
  }


  GridCall() {
    if (this.isGridShow == true) {
      this.isGridShow = false
      this.isEnquiryGridShow = true
    } else {
      this.isGridShow = true
      this.isEnquiryGridShow = false
    }
  }


  // referred By 
  //   onReferredBy($event: { term: string; items: any[] }) {
  //   
  //   this.dropdownDataService
  //     .fetchDropDownData(DropDownType.ReferredBy, $event.term, {})
  //     .subscribe({
  //       next: (value) => {

  //         if (value != null) {
  //           this.ReferredByDD = value;
  //         }

  //         console.log('this.ReferredByDD',this.ReferredByDD);
  //       },

  //       error: (err) => {
  //         this.ReferredByDD = this.getBlankObject();
  //       },

  //     });

  // }  

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }


  // update referred By in Token 

  UpdateReferredByInToken() {
    if (this.selectedLocationCode == null || this.selectedLocationCode == undefined || this.selectedLocationCode == '') {
      this.toastmeassge.error("Location Code cannot be Empty", "Select Location");
      return
    }
    if (this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined || this.CustomerVisitSourceSelected == '') {
      this.toastmeassge.error("Please Select Customer Visit Source");
      return
    }
    if (this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined || this.CustomerSourceNameSelected == '') {
      this.toastmeassge.error("Please Select Customer Source Name ");
      return
    }
    if (this.VisitPurpose == null || this.VisitPurpose == undefined || this.VisitPurpose == '') {
      this.toastmeassge.error("Please Select visit Purpose");
      return
    }



    this.ngxservice.show
    let RequestStatus = [];
    RequestStatus.push({
      "Key": "APIType",
      "Value": "UpdateReferredByInToken"
    });
    RequestStatus.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    RequestStatus.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationCode
    });
    RequestStatus.push({
      "Key": "TokenCode",
      "Value": this.tokendata.TokenCode
    });
    RequestStatus.push({
      "Key": "ReferredBy",
      "Value": ''
    });
    RequestStatus.push({
      "Key": "CustomerVisitSource",
      "Value": this.CustomerVisitSourceSelected == null || this.CustomerVisitSourceSelected == undefined ? '' : this.CustomerVisitSourceSelected
    });
    RequestStatus.push({
      "Key": "CustomerSourceName",
      "Value": this.CustomerSourceNameSelected == null || this.CustomerSourceNameSelected == undefined ? '' : this.CustomerSourceNameSelected
    });
    RequestStatus.push({
      "Key": "VisitPurpose",
      "Value": this.VisitPurpose == null || this.VisitPurpose == undefined ? '' : this.VisitPurpose
    });

    let requestdataObj = JSON.stringify(RequestStatus);
    let requstDataStringfy =
    {
      "content": requestdataObj
    }
    console.log('request data from UpdateReferredByInToken', requstDataStringfy)

    this.dynamicService.getDynamicDetaildata(requstDataStringfy).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            this.toastmeassge.success("Token Updated Successfully!");
          }
        },
        error: (err) => {
          console.log(err)
          this.toastmeassge.error(err)
        }
      })


  }


  OnCustomerVisitSource($event: { term: string; items: any[] }) {

    this.dropdownDataService
      .fetchDropDownData(DropDownType.CUSTVISITSRC, $event.term, {})
      .subscribe({
        next: (value) => {

          if (value != null) {
            this.CustomerVisitSourceDD = value;
          }

          console.log('this.CustomerVisitSourceDD', this.CustomerVisitSourceDD);
        },

        error: (err) => {
          this.CustomerVisitSourceDD = this.getBlankObject();
        },

      });

  }

  custVistSrcChange() {
    this.CustomerSourceNameSelected = null;
    this.OnCustomerSourceName({ term: "", item: [] });
  }

  OnCustomerSourceName($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CustomerSourceName, $event.term, {
      CustVisitSourceCode: this.CustomerVisitSourceSelected,
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        console.log(value)
        if (value != null) {
          console.log("CustomerSourceName", value);
          this.CustomerSourceNameDD = value;
        }
      },
      error: (err) => {
        this.CustomerSourceNameDD = DropDownValue.getBlankObject();
      }
    });
  }

}