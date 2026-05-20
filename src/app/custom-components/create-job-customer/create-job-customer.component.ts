import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DropDownType } from '../call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../call-login/metadata/product.metadata';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Filter } from '../call-login-dashboard/filter.meta';
import { Component, ViewChild, Input, Output, AfterViewInit, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Columns } from 'src/app/models/column.metadata';
import { AddProduct } from './AddProduct.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from 'src/app/config/global';
import { formatDate } from '@angular/common';
import xml2js from 'xml2js';
import { ConstantPool } from '@angular/compiler';
import { NgxSpinner } from 'ngx-spinner';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast'
import SignaturePad from "signature_pad";
import { v4 as uuidv4 } from 'uuid';
import { MatStepper } from '@angular/material/stepper';
import { CompressImageService } from 'src/app/common/Services/imageCompressService/compress-image.service';
import { lastValueFrom, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ImagePopupComponent } from './image-popup/image-popup.component';
import * as AWS from 'aws-sdk';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-create-job-customer',
  templateUrl: './create-job-customer.component.html',
  styleUrls: ['./create-job-customer.component.css']
})

export class CreateJobCustomerComponent implements OnInit {

  @ViewChild("canvas", { static: true }) canvas: ElementRef;
  sig: SignaturePad;

  isSubmitBtnDisabled: boolean = false;
  BillableOptions: any[] = ['Billable', 'Warranty Repair']
  CosmeticConditionDetail: any[] = [{
    "ELSStatusCode": "DC01",
    "ELSStatusDescription": "Display Condition"
  }, {
    "ELSStatusCode": "EC01",
    "ELSStatusDescription": "Enclosure Condition"
  },
  {
    "ELSStatusCode": "RC01",
    "ELSStatusDescription": "Rear Condition"
  },
  {
    "ELSStatusCode": "PI01",
    "ELSStatusDescription": "Product Inspection"
  }]

  DetailConditions: any[] = []
  public href: string = "";
  isDisabled: boolean = false
  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();

  campaignTwo = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, 15)),
    end: new FormControl(new Date(this.year, this.month, 19)),
  });

  repa: any;
  StoreAllData;
  name: string;
  SerialNo1 = "";
  stepIndex = 0;
  condition = true;
  tableReplacement:any[] = ["YES","NO"]
  savepdf: string;
  form: FormGroup;
  StoreValues: any;
  addproductval; any;
  product: AddProduct;
  imagePath: string;
  errorMessage: String;
  typeSelected = 'ball-clip-rotate';
  base64String: string;
  selectedCallForm: any;
  customerForm: FormGroup;
  firstFormGroup: FormGroup;
  isSignature: boolean = false
  titleOne = 'Customer Details';
  imageDeleteFrom: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  titleTwo = 'Customer Dashboard';
  isGridCard: boolean = false;
  pagination: PaginationMetaData;
  isDashBoardCard: boolean = true;
  isAddProduct: boolean = false;
  isAddProductButtonShow: boolean = false
  jobPagination: PaginationMetaData;
  disable: boolean = false;
  @ViewChild('attachments') attachment: any;
  checklistTotalvalues = [];
  imageurls = [];
  dataArray: any[] = [];
  JobList: any[];
  IssuesList: any[] = [];
  selectedList = [] = [];
  products: Product[] = [];
  ComponentList: any[] = [];
  filterList: Filter[] = [];
  jobHeaderData: any[] = [];
  actionDetails: any[] = [];
  tagColumns: Columns[] = [];
  JobColumns: Columns[] = [];
  UploadedImageList: any[] = [];
  ComponentIssueList: any[] = [];
  isDiagnosticsSuites: boolean = false
  dictData = []
  controlName = ''
  answer = ''
  dictArr = []
  SelectedComponentIssue: any[] = [];
  SignatureFileName: String;
  AuthSignatureFileName: String
  queryData;
  LocationCode:string = ''
  DocType:string = ''
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  filtersEvent: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>(null);
  tagListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  BillingStatusType: DropDownValue = DropDownValue.getBlankObject();
  PartnerListDD : DropDownValue = DropDownValue.getBlankObject();
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  callForm: DropDownValue = DropDownValue.getBlankObject();
  Component: DropDownValue = DropDownValue.getBlankObject();
  Issue: DropDownValue = DropDownValue.getBlankObject();
  CheckListMasterDropDown: DropDownValue = DropDownValue.getBlankObject();
  ELSStatusType: DropDownValue = this.getBlankObject();
  ProductType1: DropDownValue = this.getBlankObject();
  // thirdFormGroup = this._formBuilder.group({});
  fourthFormGroup = this._formBuilder.group({});
  FileUpload = { filepath: '', message: '' }
  unitReceivedDateTime = new Date();
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  isdiagnosticPop: boolean = false;
  isverificationPopup: boolean = false;
  isVerification: boolean = false;
  DatePicker: string;
  billToCustomerFirstName: string = ''
  billToCustomerMobileNo: string = ''
  billToCustomerEmailId: string = ''

  questionArray: any[] = [];
  frontImage: any[] = [];

  isFrontIcon: boolean = true;
  isBackIcon: boolean = true;
  isTopIcon: boolean = true;
  isBottomIcon: boolean = true;
  isRightIcon: boolean = true;
  hidePopup: boolean = true
  popUpArray: any[] = []
  isLeftIcon: boolean = true;

  // image array
  frontImageList: any[] = [];
  backImageList: any[] = [];
  topImageList: any[] = [];
  bottomImageList: any[] = [];
  rightImageList: any[] = [];
  leftImageList: any[] = [];
  deviceImageList: any[] = [];
  otherImageList: any[] = [];
  imageListArray: any[] = [];
  CustomerObject: any[] = [];
  // Reservation
  ReservationGUID: string;
  ReservationCode: string;

  verificationList: any = {};
  elsStatusTextValue: String;

    BindAmcContractDetailsDD: DropDownValue = DropDownValue.getBlankObject();
    ContractStartDate:any;
    ContractEndDate:any;
    ContractCode:any;


  constructor(
    private route: Router,
    private sanitize: DomSanitizer,
    private toasty: ToastrService,
    private gsxService: GsxService,
    private _formBuilder: FormBuilder,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private compressImage: CompressImageService,
    private dialog: MatDialog,
    private datePipe: DatePipe,


  ) {

    this.thirdFormGroup = this.formBuilder.group({
      component: [],
      issues: [],

    });

    this.firstFormGroup = this.formBuilder.group({
      firstnameReset: [],
      resetnumber: [],
    });
    this.secondFormGroup = this.formBuilder.group({
      SerialNo: [],
      ProductTypeValues: [],
      ServiceType: [],
      BillingOptions: [],
      ElsStatus: [],
      CustomerVoice: [],
      TableReplacement:[],
      DataBackup: [],
      CREVoice: [],
      LocationCode: [],
      SelectedProduct: [],
      SelectedDate: [],
      Condition: [],
      CustomerCompanyName: [],
      EstimatedServiceCharges: [],
      PartnerList: [],
      MembershipCardNo: [],
      SecurityNo: [],
      EstimatedPartsCost: [],
      PouchNo: [],
      TechnicianRemark: []
      // null, Validators.required
    })
  }


  pic = ".PNG";



  async frontImageClick(event: any) {
    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      if( fileToUpload.type.match(/\/jpg|\/jpeg|\/png|\/pdf/) == null ){
        this.toasty.error("Please select a jpg, jpeg, png or pdf file type");
        return;
      }
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      // const formData = new FormData();
      // formData.append('file', fileToUpload, filename);
      this.ngxSpinnerService.show()
      try
      {
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) //.subscribe(
          // {
          //   next: (value) => {
              
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.frontImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name
              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name
              })
              this.isFrontIcon = false;

          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }
   

  }


  removefrontImage(item) {
    let index = this.frontImageList.indexOf(item);
    this.frontImageList.splice(index, 1);
    this.isFrontIcon = true;
  }

  togglePopup() {
    this.hidePopup = !this.hidePopup
    if (this.hidePopup == false) {
      this.GetCustomerList('', '', '')
    }
  }

  GetCustomerList(customername, phonenumber, gmail) {
    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerList4Job"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": ''
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": customername
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": gmail
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
          this.popUpArray = []
          try {
            this.ngxSpinnerService.hide()
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log
              if (Array.isArray(data?.CustomerList?.Customer)) {
                this.popUpArray = data?.CustomerList?.Customer;
              }
              else {
                this.popUpArray.push(data?.CustomerList?.Customer);
              }
              this.popUpArray.forEach(item => {
                item.isSelected = false;
              })
            }
          } catch (ext) {
          }
        },
        error: err => {
        }

      }
    );
  }

  getCustomerObject() {
    this.GetCustomerList(this.billToCustomerFirstName, this.billToCustomerMobileNo, this.billToCustomerEmailId,)
  }

  updateBillToCustomer() {
    this.CustomerObject = []
    for (let item of this.popUpArray) {
      if (item.isSelected == true) {
        this.CustomerObject.push(item)
        this.billToCustomerEmailId = ''
        this.billToCustomerFirstName = ''
        this.billToCustomerMobileNo = ''
        this.hidePopup = true
        let requestData = []
        requestData.push({
          "Key": "ApiType",
          "Value": "UpdateBillToCustomerCode"
        })
        requestData.push({
          "Key": "CustomerCode",
          "Value": this.CustomerCode1
        })
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        })
        requestData.push({
          "Key": "BillToCustomerCode",
          "Value": item.CustomerCode
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
                this.toasty.success("Bill To Customer Code updated successfully")
                let data = JSON.parse(response.ExtraData)
                
              }
              else {
                console.log("error");
              }
            },
            error: err => {
              console.log(err);
            }
          });
        break

      }
    }
    console.log(this.CustomerObject)
  }


  async backImageClick(event: any) {


    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      if( fileToUpload.type.match(/\/jpg|\/jpeg|\/png|\/pdf/) == null ){
        this.toasty.error("Please select a jpg, jpeg, png or pdf file type");
        return;
      }
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.backImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src":uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, //glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.isBackIcon = false;
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }

   

  }

  removebackImage(item) {
    let index = this.backImageList.indexOf(item);
    this.backImageList.splice(index, 1);
    this.isBackIcon = true;
  }


  async topImageClick(event: any) {


    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

        this.dynamicService.uploadFileToS3Local(fileToUpload, filename) //.subscribe(
          // {
          //   next: (value) => {
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.topImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath,// glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.isTopIcon = false;
          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }

   

  }

  removetopImage(item) {
    let index = this.topImageList.indexOf(item);
    this.topImageList.splice(index, 1);
    this.isTopIcon = true;
  }


  async bottomImageClick(event: any) {


    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

        this.dynamicService.uploadFileToS3Local(fileToUpload, filename) // .subscribe(
          // {
          //   next: (value) => {
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.bottomImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src":  uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src":  uploadedimage?.dbPath,//  glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.isBottomIcon = false;
          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }

   
    this.isBottomIcon = false;

  }

  removebottomImage(item) {
    let index = this.bottomImageList.indexOf(item);
    this.bottomImageList.splice(index, 1);
    this.isBottomIcon = true;
  }

  async leftImageClick(event: any) {


    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

        // this.dynamicService.uploadFileToS3Local(fileToUpload, filename).subscribe(
          // {
          //   next: (value) => {
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.leftImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.isLeftIcon = false;
          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }

   
    this.isLeftIcon = false;

  }

  removeleftImage(item) {
    let index = this.leftImageList.indexOf(item);
    this.leftImageList.splice(index, 1);
    this.isLeftIcon = true;
  }

  async rightImageClick(event: any) {


    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

        // this.dynamicService.uploadFileToS3Local(fileToUpload, filename).subscribe(
          // {
          //   next: (value) => {
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.rightImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath,// glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name

              })
              this.isRightIcon = false;
          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }
    }

   
    this.isRightIcon = false;

  }

  removerightImage(item) {
    let index = this.rightImageList.indexOf(item);
    this.rightImageList.splice(index, 1);
    this.isRightIcon = true;
  }


  viewImage(item) {

    this.dialog.open(ImagePopupComponent, {
      data: { Imagesrc: item.src }
    });
    // window.open(item.src)
  }
  removeImageEdit(i, imagepath) {
    this.imageDeleteFrom.value.id = i;
    this.imageDeleteFrom.value.ImagePath = imagepath;
  }

  removeImage(i) {
    this.imageurls.splice(i, 1);
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.imageurls.push({ base64String: event.target.result, });
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  Set_Non_Serialised() {
    if (this.product.ProductTypeValues == "NONSERIALIZED") {
      this.product.SerialNo = "ZZ501AAAOWP"
      this.Search_Serialno()
    } else {
      this.product.SerialNo = ""
      this.appleCare = ""
      this.product.PurchaseCountryDesc = ""
      this.onSiteCoverage = ""
      this.partCover = ""
      this.laborCover = ""
      this.product.GsxWarrantyStatusDescription = ""
      this.product.ProductDescription = ""
      this.product.ConfigDescription = ""

    }
  }

  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  addJobCreateSignature() {
    if (this.isSignature == true) {
      this.isSignature = false;
    } else {
      this.isSignature = true;
    }
  }

  addProductForCheckList() {
    if (this.isAddProduct == true) {
      this.isAddProduct = false;
    } else {
      this.isAddProduct = true;
    }
  }




  ClearSignature() {
    ;
    this.sig.clear();
    this.SignatureFileName = "";
  }

  ngOnInit(): void {
    
    this.queryData = this.activatedRoute.snapshot.queryParams;
    this.secondFormGroup.controls['LocationCode'].disable();
    this.LocationCode = this.queryData.lc
    this.DocType = this.queryData.doctype
    this.SignatureFileName = "";
    if( this.queryData.rc && this.queryData.rc != ''){
      this.ReservationCode = this.queryData.rc
      this.getReservationObject()
    }
    this.AuthSignatureFileName ='';
    this.ngxSpinnerService.show();
    setTimeout(() => {
      this.ngxSpinnerService.hide();
    }, 50);

    this.product = new AddProduct();
    this.onCallFormSearch({ term: "", item: null });
    this.thirdFormGroup = this.formBuilder.group
      ({
        component: [],
        issues: [],
      })

    this.getData();
    this.onCallFormSearch({ term: "", item: null });
    this.onSelectComponent({ term: "", items: [] });
    this.onSelectIssue({ term: "", items: [] })
    this.onELSStatusSearch({ term: "", items: [] });
    this.onProductType({ term: "", items: [] });
    this.onBillingOptionSearch({ term: "", items: [] });
    this.onPartnerListSearch({ term: "", items: [] });
    this.onLocationSearch({ term: "", item: [] })
    this.ResetSecondFormdata();
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
              
              console.log("Reservation Object" , data)
              this.ReservationGUID = data.Reservation.ReservationGUID   
              this.secondFormGroup.patchValue({
                CustomerVoice: data.Reservation.ProblemOrRemark
              })   
              if (  data.Reservation.WarehouseLocationCode  != null ||  data.Reservation.WarehouseLocationCode != undefined ){
                this.LocationCode =  data.Reservation.WarehouseLocationCode 
              }
            }
            else {
              this.toasty.error("No Reservation Data found")
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

  onCardSelected(job) {
    this.filterList = [];
    this.isGridCard = true
    this.isDashBoardCard = false;
    this.filtersEvent.next(this.filterList);
    this.filterList.push(new Filter("JobType", job.JobTypeDescription, job.JobType))
    this.filterList.push(new Filter("JobStatus", job.JobStatusDesc, job.JobStatusCode));
  }


  isEditable = false;

  getColumn(datatyle: string, title: String, field: String): Columns {
    let cal = new Columns();
    cal.datatype = datatyle;
    cal.title = title;
    cal.field = field;
    return cal;
  }

  content = this.sanitize.bypassSecurityTrustHtml(`
 <svg  width="28" height="23" viewBox="0 0 28 23" fill="none">
 <path fill-rule="evenodd" clip-rule="evenodd" d="M5.22664 1.53345H5.1333C4.70584 1.53345 4.3381 1.53345 4.0133 1.59631C3.51049 1.69501 3.05076 1.90612 2.68504 2.20626C2.31933 2.5064 2.06191 2.88384 1.9413 3.29678C1.86664 3.56358 1.86664 3.86411 1.86664 4.21678V8.05011C1.86664 8.40125 1.86664 8.70331 1.94317 8.97011C2.06332 9.38314 2.32032 9.76078 2.68571 10.0612C3.0511 10.3616 3.5106 10.573 4.0133 10.6721C4.3381 10.7334 4.70397 10.7334 5.1333 10.7334H9.79997C10.2274 10.7334 10.5952 10.7334 10.92 10.6706C11.4228 10.5719 11.8825 10.3608 12.2482 10.0606C12.614 9.7605 12.8714 9.38305 12.992 8.97011C13.0666 8.70331 13.0666 8.40278 13.0666 8.05011V4.21678C13.0666 3.86565 13.0666 3.56358 12.9901 3.29678C12.87 2.88376 12.613 2.50612 12.2476 2.20571C11.8822 1.9053 11.4227 1.69385 10.92 1.59478C10.5952 1.53345 10.2293 1.53345 9.79997 1.53345H5.22664ZM4.44824 3.08825C4.5285 3.07291 4.65357 3.06678 5.22664 3.06678H9.70664C10.2816 3.06678 10.4048 3.07138 10.485 3.08825C10.6527 3.12119 10.806 3.19163 10.9279 3.29177C11.0498 3.39192 11.1356 3.51784 11.1757 3.65558C11.1944 3.71998 11.2 3.82118 11.2 4.29345V7.97345C11.2 8.44571 11.1944 8.54691 11.1738 8.61285C11.1337 8.75059 11.048 8.87651 10.9261 8.97665C10.8042 9.07679 10.6509 9.14724 10.4832 9.18018C10.4066 9.19398 10.2834 9.20011 9.70664 9.20011H5.22664C4.6517 9.20011 4.5285 9.19551 4.44824 9.17865C4.28056 9.14571 4.12726 9.07526 4.00534 8.97512C3.88343 8.87498 3.79767 8.74905 3.75757 8.61131C3.74077 8.54845 3.7333 8.44725 3.7333 7.97345V4.29345C3.7333 3.82118 3.7389 3.71998 3.75944 3.65405C3.79954 3.51631 3.8853 3.39038 4.00721 3.29024C4.12912 3.1901 4.28242 3.11965 4.4501 3.08671L4.44824 3.08825ZM18.2933 1.53345H18.2C17.7725 1.53345 17.4048 1.53345 17.08 1.59631C16.5772 1.69501 16.1174 1.90612 15.7517 2.20626C15.386 2.5064 15.1286 2.88384 15.008 3.29678C14.9333 3.56358 14.9333 3.86411 14.9333 4.21678V8.05011C14.9333 8.40125 14.9333 8.70331 15.0098 8.97011C15.13 9.38314 15.387 9.76078 15.7524 10.0612C16.1178 10.3616 16.5773 10.573 17.08 10.6721C17.4048 10.7334 17.7706 10.7334 18.2 10.7334H22.8666C23.2941 10.7334 23.6618 10.7334 23.9866 10.6706C24.4895 10.5719 24.9492 10.3608 25.3149 10.0606C25.6806 9.7605 25.938 9.38305 26.0586 8.97011C26.1333 8.70331 26.1333 8.40278 26.1333 8.05011V4.21678C26.1333 3.86565 26.1333 3.56358 26.0568 3.29678C25.9366 2.88376 25.6796 2.50612 25.3142 2.20571C24.9488 1.9053 24.4893 1.69385 23.9866 1.59478C23.6618 1.53345 23.296 1.53345 22.8666 1.53345H18.2933ZM17.5149 3.08825C17.5952 3.07291 17.7202 3.06678 18.2933 3.06678H22.7733C23.3482 3.06678 23.4714 3.07138 23.5517 3.08825C23.7194 3.12119 23.8727 3.19163 23.9946 3.29177C24.1165 3.39192 24.2023 3.51784 24.2424 3.65558C24.261 3.71998 24.2666 3.82118 24.2666 4.29345V7.97345C24.2666 8.44571 24.2592 8.54691 24.2405 8.61285C24.2004 8.75059 24.1146 8.87651 23.9927 8.97665C23.8708 9.07679 23.7175 9.14724 23.5498 9.18018C23.4714 9.19551 23.3482 9.20011 22.7733 9.20011H18.2933C17.7184 9.20011 17.5952 9.19551 17.5149 9.17865C17.3472 9.14571 17.1939 9.07526 17.072 8.97512C16.9501 8.87498 16.8643 8.74905 16.8242 8.61131C16.8074 8.54845 16.8 8.44725 16.8 7.97345V4.29345C16.8 3.82118 16.8056 3.71998 16.8261 3.65405C16.8662 3.51631 16.952 3.39038 17.0739 3.29024C17.1958 3.1901 17.3491 3.11965 17.5168 3.08671L17.5149 3.08825ZM5.1333 12.2668H9.79997C10.2274 12.2668 10.5952 12.2668 10.92 12.3296C11.4228 12.4283 11.8825 12.6395 12.2482 12.9396C12.614 13.2397 12.8714 13.6172 12.992 14.0301C13.0666 14.2969 13.0666 14.5974 13.0666 14.9501V18.7834C13.0666 19.1346 13.0666 19.4366 12.9901 19.7034C12.87 20.1165 12.613 20.4941 12.2476 20.7945C11.8822 21.0949 11.4227 21.3064 10.92 21.4054C10.5952 21.4668 10.2293 21.4668 9.79997 21.4668H5.1333C4.70584 21.4668 4.3381 21.4668 4.0133 21.4039C3.51049 21.3052 3.05076 21.0941 2.68504 20.794C2.31933 20.4938 2.06191 20.1164 1.9413 19.7034C1.86664 19.4366 1.86664 19.1361 1.86664 18.7834V14.9501C1.86664 14.599 1.86664 14.2969 1.94317 14.0301C2.06332 13.6171 2.32032 13.2394 2.68571 12.939C3.0511 12.6386 3.5106 12.4272 4.0133 12.3281C4.3381 12.2668 4.70397 12.2668 5.1333 12.2668ZM5.22664 13.8001C4.6517 13.8001 4.5285 13.8047 4.44824 13.8216C4.28056 13.8545 4.12726 13.925 4.00534 14.0251C3.88343 14.1252 3.79767 14.2512 3.75757 14.3889C3.74077 14.4518 3.7333 14.553 3.7333 15.0268V18.7068C3.7333 19.179 3.7389 19.2802 3.75944 19.3462C3.79954 19.4839 3.8853 19.6098 4.00721 19.71C4.12912 19.8101 4.28242 19.8806 4.4501 19.9135C4.52851 19.9288 4.6517 19.9334 5.22664 19.9334H9.70664C10.2816 19.9334 10.4048 19.9273 10.485 19.912C10.6527 19.879 10.806 19.8086 10.9279 19.7085C11.0498 19.6083 11.1356 19.4824 11.1757 19.3446C11.1944 19.2802 11.2 19.179 11.2 18.7068V15.0268C11.2 14.5545 11.1944 14.4533 11.1738 14.3874C11.1337 14.2496 11.048 14.1237 10.9261 14.0236C10.8042 13.9234 10.6509 13.853 10.4832 13.82C10.4066 13.8062 10.2834 13.8001 9.70664 13.8001H5.22664ZM18.2933 12.2668H18.2C17.7725 12.2668 17.4048 12.2668 17.08 12.3296C16.5772 12.4283 16.1174 12.6395 15.7517 12.9396C15.386 13.2397 15.1286 13.6172 15.008 14.0301C14.9333 14.2969 14.9333 14.5974 14.9333 14.9501V18.7834C14.9333 19.1346 14.9333 19.4366 15.0098 19.7034C15.13 20.1165 15.387 20.4941 15.7524 20.7945C16.1178 21.0949 16.5773 21.3064 17.08 21.4054C17.4048 21.4683 17.7725 21.4683 18.2 21.4683H22.8666C23.2941 21.4683 23.6618 21.4683 23.9866 21.4054C24.4891 21.3065 24.9484 21.0953 25.3138 20.7952C25.6792 20.495 25.9363 20.1177 26.0568 19.705C26.1333 19.4382 26.1333 19.1361 26.1333 18.785V14.9501C26.1333 14.599 26.1333 14.2969 26.0568 14.0301C25.9366 13.6171 25.6796 13.2394 25.3142 12.939C24.9488 12.6386 24.4893 12.4272 23.9866 12.3281C23.6618 12.2668 23.296 12.2668 22.8666 12.2668H18.2933ZM17.5149 13.8216C17.5952 13.8062 17.7202 13.8001 18.2933 13.8001H22.7733C23.3482 13.8001 23.4714 13.8047 23.5517 13.8216C23.7194 13.8545 23.8727 13.925 23.9946 14.0251C24.1165 14.1252 24.2023 14.2512 24.2424 14.3889C24.261 14.4533 24.2666 14.5545 24.2666 15.0268V18.7068C24.2666 19.179 24.2592 19.2802 24.2405 19.3462C24.2004 19.4839 24.1146 19.6098 23.9927 19.71C23.8708 19.8101 23.7175 19.8806 23.5498 19.9135C23.4714 19.9288 23.3482 19.9334 22.7733 19.9334H18.2933C17.7184 19.9334 17.5952 19.9273 17.5149 19.912C17.3472 19.879 17.1939 19.8086 17.072 19.7085C16.9501 19.6083 16.8643 19.4824 16.8242 19.3446C16.8074 19.2818 16.8 19.1806 16.8 18.7068V15.0268C16.8 14.5545 16.8056 14.4533 16.8261 14.3874C16.8662 14.2496 16.952 14.1237 17.0739 14.0236C17.1958 13.9234 17.3491 13.853 17.5168 13.82L17.5149 13.8216Z"  fill="#767676" class="svg-color"/>
 </svg>`);

  contentOne = this.sanitize.bypassSecurityTrustHtml(`
<svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21" fill="none">
<path d="M21.6474 0.272705H1.18588C0.959763 0.272705 0.74291 0.381893 0.583023 0.576249C0.423136 0.770605 0.333313 1.03421 0.333313 1.30907V18.9272C0.333313 19.477 0.51296 20.0042 0.832733 20.3929C1.15251 20.7816 1.58621 21 2.03844 21H20.7949C21.2471 21 21.6808 20.7816 22.0006 20.3929C22.3203 20.0042 22.5 19.477 22.5 18.9272V1.30907C22.5 1.03421 22.4102 0.770605 22.2503 0.576249C22.0904 0.381893 21.8735 0.272705 21.6474 0.272705ZM2.03844 8.56361H6.30126V12.7091H2.03844V8.56361ZM8.00639 8.56361H20.7949V12.7091H8.00639V8.56361ZM20.7949 2.34543V6.49089H2.03844V2.34543H20.7949ZM2.03844 14.7818H6.30126V18.9272H2.03844V14.7818ZM20.7949 18.9272H8.00639V14.7818H20.7949V18.9272Z" fill="#767676" fill-opacity="1" class="svg-color"/>
</svg>`);


  getJobDashboard() {
    ;
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobDashboard"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": params.nc
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
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            let JobTypeDescription = [];
            for (let job of response.ExtraDataJSON.Dashboard) {
              JobTypeDescription.push(job.JobTypeDescription);
            }
            var set = new Set(JobTypeDescription);
            JobTypeDescription = [...set];
            this.jobHeaderData = [];
            for (let job of JobTypeDescription) {
              let jobList = [];
              for (let jobItem of response.ExtraDataJSON.Dashboard) {
                if (jobItem.JobTypeDescription == job) {
                  jobList.push(jobItem);
                }
              }
              this.jobHeaderData.push({
                "header": job,
                "list": jobList
              });
            }
          }
        },
        error: err => {
        }
      }

    );
  }

  onDirectSelectMenu(index: number) {
    this.stepIndex = index;
    this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
  }

  jobLoadPageData(details) {
    switch (details.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = details.eventDetail.pageIndex + 1;
        break;
      case "Sorting":
        this.jobPagination.SortOrder = details.eventDetail.direction;
        this.jobPagination.Sorting = details.eventDetail.active;
        break;
    }
    setTimeout(() => { this.jobListHideSpinnerEvent.next(); }, 1);
  }

  actionEmit(event) {
    switch (event.action) {
      case "ROWSELECT":

        break;
      case "Delete":
        break;
    }
  }


  loadPageData(details) {
    switch (details.eventType) {
      case "PageChange":
        this.pagination.PageNumber = details.eventDetail.pageIndex + 1;
        break;
      case "Sorting":
        this.pagination.SortOrder = details.eventDetail.direction;
        this.pagination.Sorting = details.eventDetail.active;
        break;
    }
    setTimeout(() => { this.tagListHideSpinnerEvent.next(); }, 1);
  }

  CustomerCode1;
  EmailID;
  MobileNo;
  CountryCode;
  CustomerName;
  FirstName;
  LastName;
  Address1;
  getData() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetRtlCustomerObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": params.nc
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

            let data = JSON.parse(response.ExtraData).Customer;
            this.CustomerCode1 = data.CustomerCode,
              this.CustomerName = data.CustomerName,
              this.FirstName = data.FirstName
            this.LastName = data.LastName
            this.EmailID = data.EmailID,
              this.MobileNo = data.MobileNo,
              this.CountryCode = data.CountryCode,
              this.Address1 = data.Address1,
              this.secondFormGroup.patchValue({
              })
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

  createForm() {
    this.customerForm = new FormGroup({
      callCode: new FormControl({ value: null, disabled: true }),
      materialName: new FormControl({ value: null, disabled: true }),
      warrantyStatus: new FormControl({ value: null, disabled: true }),
      warrantyEndDate: new FormControl({ value: null, disabled: true }),
      customerComplaint: new FormControl({ value: null, disabled: true }),
      CREVoice: new FormControl({ value: null, disabled: true }),
      CustomerCompanyName: new FormControl({ value: null, disabled: true }),
      EstimatedServiceCharges :  new FormControl({ value: null, disabled: true }),
      PartnerList: new FormControl({value : null, disabled: true}),
      MembershipCardNo :   new FormControl({ value: null, disabled: true }),
      SecurityNo: new FormControl({ value: null, disabled: true }),
      EstimatedPartsCost:  new FormControl({ value: null, disabled: true }),
      PouchNo: new FormControl({ value: null, disabled: true }),
      TechnicianRemark: new FormControl({ value: null, disabled: true }),
    })
  }

  selectedCustomer: any;
  selectedCompany: any;
  getJobDetail() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobDetails"
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.selectedCustomer
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": this.selectedCompany
    });
    requestData.push({
      "Key": "JobType",
      "Value": this.selectedCallForm
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
              if (Array.isArray(response["ExtraDataJSON"]['JobData']) != true) {
                this.JobList = [response["ExtraDataJSON"]['JobData']];
              } else {
                this.JobList = response["ExtraDataJSON"]['JobData'];
              }
              this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
            }
            else {
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

  productlist: any[];

  handleError(response: any, product: Product) {
    console.log("handleError form", this.customerForm.controls['PhoneNo']);
    console.log(response.errorMessageJson.ERRORLIST.ERRORMESSAGE);
    for (let error of response.errorMessageJson.ERRORLIST.ERRORMESSAGE) {
      let controlName = "";
      switch (error.FIELDNAME[0]) {
        case "SerialNo1":
          controlName = "serialNo";
          break;
        case "JobWarrantyStatus":
          controlName = "warrantyStatus";
          break;
        case "ElsStatus":
          controlName = "ELSStatus";
          break;
        case "MaterialCode":
          controlName = "materialCode";
          break;

      }
      product.productForm.controls[controlName].setErrors({ "Invalid": true, "Message": error.ERRORMESSAGE[0] });
    }
  }


  Pdf_Func() {
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetJobObject4Print",
    });
    PdfData.push({
      "Key": "CaseGuid",
      "Value": "FBE6E2D7-3DCF-40D5-BAA8-5EB2B9F16D15",
    });
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    let storepdf = contentRequest;
    this.reportService.downloadServiceReport('SERVICE', contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
        },
        error: err => {
          console.log(err);
        }
      });
  }

  //  Add product code start from here
  getComponentIssueXml() {
    let rawData = {
      "rows": []
    }
    for (let item of this.SelectedComponentIssue) {
      rawData.rows.push({
        "row": {
          "ComponentCode": item.component.componentCode,
          "IssueCode": item.issues.code,
          "ComponentDesc": item.component.componentDescription,
          "IssueDesc": item.issues.description
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  getImagePath() {
    ;
    let rowsDataValue = {
      "rows": []
    }
    for (let StoreImage of this.UploadedImageList) {

      rowsDataValue.rows.push({
        "row": {
          "AttachmentOriginType": "JOBCREATION",
          "AttachmentType": "Image",
          "AttachmentFile": StoreImage.AttachmentFile,
          "CloudFlag" : "1"
        }
      })
    }
    rowsDataValue.rows.push({
      "row": {
        "AttachmentOriginType": "JOBCREATION",
        "AttachmentType": "SIGNATURE",
        "AttachmentFile": this.SignatureFileName,
        "CloudFlag" : "1"
      }
    })
    rowsDataValue.rows.push({
      "row": {
        "AttachmentOriginType": "JOBCREATION",
        "AttachmentType": "AUTHSIGNATURE",
        "AttachmentFile": this.AuthSignatureFileName,
        "CloudFlag" : "1"
      }
    })
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rowsDataValue);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }


  async OnFileUploadClick(event: any) {
    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      this.ngxSpinnerService.show()
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 
        
        // this.dynamicService.uploadFileToS3Local(fileToUpload, filename).subscribe(
          // {
          //   next: (value) => {
              this.ngxSpinnerService.hide()
              let uploadedimage: any;
              uploadedimage = value;
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name
              })
          //   },
          //   error: (err) => {
          //     this.ngxSpinnerService.hide()
          //     this.toasty.error(err)
          //   },

          // });
      } 
      catch (err) {
        this.ngxSpinnerService.hide()
        this.toasty.error(err.message || err);
      }        
    }

   
  }

  removeSelectedFile(item) {
    let index = this.UploadedImageList.indexOf(item);
    this.UploadedImageList.splice(index, 1);
  }

  imagePreviewSrc: string | ArrayBuffer | null | undefined = '';
  isImageSelected: boolean = false;
  showPreview(event: Event) {
    let selectedFile = (event.target as HTMLInputElement).files?.item(0)
    if (selectedFile) {
      if (["image/jpeg", "image/png", "image/svg+xml"].includes(selectedFile.type)) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(selectedFile);

        fileReader.addEventListener('load', (event) => {
          this.imagePreviewSrc = event.target?.result;
          this.isImageSelected = true
        })
      }
    } else {
      this.isImageSelected = false
    }
  }
  selectedFiles: any;
  selectFile(event) {
    this.selectedFiles = event.target.files;
  }
  selectedFile: File;
  ArrayOfSelectedFile = new Array<string>();
  removeQuantity(i: number) {
  }

  validateComponents(com: any) {
    for (let item of this.SelectedComponentIssue) {
      if (item.component.componentCode == com.component.componentCode && item.issues.code == com.issues.code) {
        return false;
      }
    }
    return true;
  }


  removeComponent(item) {
    let index = this.SelectedComponentIssue.indexOf(item);
    this.SelectedComponentIssue.splice(index, 1);
  }

  controlValidations() {
    var isValid = true;
    var isDataValid = this.validateProductForm()
    if (isDataValid == false) {
      this.toasty.error("Please Fetch Serial No Details");

      this.validateProductForm()
      isValid = false;
      return isValid;
    }
    if (this.product.ProductDescription == 'Non-serialized Products' && this.product.ProductTypeValues != 'NONSERIALIZED') {
      this.toasty.error("Please Select Product Type = Non-Serialised ");
      isValid = false;
      return isValid;
    }
    if (this.product.ProductDescription != 'Non-serialized Products' && this.product.ProductTypeValues == 'NONSERIALIZED') {
      this.toasty.error("Please Select Product Type = Serialised ");
      isValid = false;
      return isValid;
    }
    if (this.UploadedImageList.length < 2) {

      this.toasty.error("Please Add Images");
      isValid = false;
      return isValid;

    }
    for (let item of this.checklistTotalvalues) {
      var questions = item.ChecklistDescription;
      var answer = item.answer;
      if (answer == null || answer == undefined || answer == "") {
        this.toasty.error("Checklist " + questions + " can not be blank");
        isValid = false;
        break;
      }
    }
    return isValid;

  }

  controlSVNRValidations() {
    
    var isValid = true;
    var isDataValid = this.validateSVNRProductForm()
    if (isDataValid == false) {
      this.toasty.error("Please Fetch Serial No Details");
      this.validateSVNRProductForm()
      isValid = false;
      return isValid;
    }

    // if (this.product.TechnicianRemark == null || this.product.TechnicianRemark ==  undefined ) {
    //   this.toasty.error("Please add Technician Remark ");
    //   isValid = false;
    //   return isValid;
    // }

    if (this.product.ProductDescription == 'Non-serialized Products' && this.product.ProductTypeValues != 'NONSERIALIZED') {
      this.toasty.error("Please Select Product Type = Non-Serialised ");
      isValid = false;
      return isValid;
    }
    if (this.product.ProductDescription != 'Non-serialized Products' && this.product.ProductTypeValues == 'NONSERIALIZED') {
      this.toasty.error("Please Select Product Type = Serialised ");
      isValid = false;
      return isValid;
    }

    if (this.UploadedImageList.length < 2) {
      this.toasty.error("Please Add Images");
      isValid = false;
      return isValid;
    }
  
    return isValid;

  }

  onSubmit() {
    let object = {
      "component": this.thirdFormGroup.get("component").value,
      "issues": this.thirdFormGroup.get("issues").value
    };
    if (this.thirdFormGroup.valid) {
      if (this.validateComponents(object)) {
        this.SelectedComponentIssue.push(object);
        this.thirdFormGroup.reset();
      } else {
        this.toasty.error("Component and defect already exist.");
        this.thirdFormGroup.reset();
      }
    } else {
      this.toasty.error("Please select required field");
    }
  }

  onCallFormSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.callForm, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {

          console.log("Call Form :-   ",value)
          this.callForm = value;
          if(this.queryData.rc && this.queryData.rc != ''){
            this.secondFormGroup.patchValue({
              ServiceType: "PIK1"
            })
          } 

          for (let item of value.Data) {
            if (item.Id == "CIN1") {
              this.secondFormGroup.patchValue({
                ServiceType: item.Id
              })
              break
            }
          }

          if ( this.DocType == 'snr'){
              this.secondFormGroup.patchValue({
              ServiceType: 'SNR'
            })
          }
          else{
            this.callForm.Data = this.callForm.Data.filter(item => item.Id !== 'SNR');
          }
        }
      },
      error: (err) => {
        this.callForm = DropDownValue.getBlankObject();
      }

    });
  }

  onBillingOptionSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BillingOption, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          // console.log(value);
          this.BillingStatusType = value;
        }
      },
      error: (err) => {
        this.BillingStatusType = this.getBlankObject();
      }
    });
  }

  onPartnerListSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.PartnerList, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          // console.log(value);
          this.PartnerListDD = value;
        }
      },
      error: (err) => {
        this.PartnerListDD = this.getBlankObject();
      }
    });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  onSelectComponent($event) { this.IssuesList = $event.issues; }
  onSelectIssue($event: { term: string; items: any[] }) { }
  RealValues;
  get_Component_Issue() {
    let searchData = { device: { "id": this.product.SerialNo } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.getComponentIssue(contentRequest).subscribe(
      {
        next: (value) => {
          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          this.ComponentIssueList = response.componentIssues;
          this.ComponentList = this.ComponentIssueList;
        }
      });
  }
  
  SerialNo2;
  StoreAllResponse: any = []
  data: any[] = []

  getFindMyStatus()
  {
    this.ngxSpinnerService.show()
    let searchData = { unitReceivedDateTime: this.unitReceivedDateTime,repairType:"SVNR", device: { "id": this.product.SerialNo } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    }
    this.gsxService.getRepairEligibilityWOJob(contentRequest).subscribe({
      next:(value)=>{
        
        let storeAllResponse = JSON.parse(value.toString())
        console.log(storeAllResponse,"findmy")
        if (!(storeAllResponse["errors"] == undefined || storeAllResponse["errors"] == null)) {
          this.toasty.error(storeAllResponse["errors"][0].code + ' - ' + storeAllResponse["errors"][0].message);
          this.ngxSpinnerService.hide();
          return;
        }
        else {
          if(storeAllResponse?.eligibilityDetails?.outcome[0]?.reasons[0]?.messages[0].includes('Find My for this device is active. Find My must be turned off for non-accessory repairs. See OP987 for details.'))
          {
            this.toasty.show(storeAllResponse?.eligibilityDetails?.outcome[0]?.reasons[0]?.messages[0].toString())
          }
          this.ngxSpinnerService.hide();
        }
      },
      error:(err)=>{
        this.ngxSpinnerService.hide()
        console.log(err)
        this.toasty.error(err)
      }
    })
  }


  Search_Serialno() {
  
    this.onBindAmcContractDetails({ term: "", item: [] },this.product.SerialNo)

    this.ngxSpinnerService.show()
    let searchData = { unitReceivedDateTime: this.unitReceivedDateTime, device: { "id": this.product.SerialNo } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("device ", contentRequest)
    this.gsxService.getDeviceDetails(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.StoreAllResponse = JSON.parse(value.toString());
          console.log("Data After ", this.StoreAllResponse)
          if (!(this.StoreAllResponse["errors"] == undefined || this.StoreAllResponse["errors"] == null)) {
            this.toasty.error(this.StoreAllResponse["errors"][0].code + ' - ' + this.StoreAllResponse["errors"][0].message);
            this.ngxSpinnerService.hide();
            return;
          }
          else {
            this.toasty.success("Serial number  found successfully");
            this.getFindMyStatus()
            this.ngxSpinnerService.hide();
          }
          this.isSubmitBtnDisabled = false;
          this.product.ImageUrl = this.StoreAllResponse.device.productImageURL;
          this.product.Imei = this.StoreAllResponse.device.identifiers.imei
          this.product.Meid = this.StoreAllResponse.device.identifiers.meid;
          this.product.ProductDescription = this.StoreAllResponse.device.productDescription;
          this.Checklist_Master(this.product.ProductDescription)
          // this.product.CoverageStartDate = this.StoreAllResponse.device.warrantyInfo.coverageStartDate;
          let purchaseDate = this.StoreAllResponse.device.warrantyInfo.purchaseDate
          this.product.CoverageStartDate = purchaseDate == null || purchaseDate == undefined ? "" : purchaseDate.toString().replace('Z', '')
          this.product.GsxWarrantyStatusCode = this.StoreAllResponse.device.warrantyInfo.warrantyStatusCode;
          this.product.GsxWarrantyStatusDescription = this.StoreAllResponse.device.warrantyInfo.warrantyStatusDescription;
          this.product.CoverageEndDate = this.StoreAllResponse.device.warrantyInfo.coverageEndDate;
          this.product.ConfigCode = this.StoreAllResponse.device.configCode;
          this.product.ConfigDescription = this.StoreAllResponse.device.configDescription;
          this.product.PurchaseDate = this.StoreAllResponse.device.warrantyInfo.purchaseDate;
          this.SerialNo2 = this.StoreAllResponse.device.identifiers.serial;
          this.product.OnsiteCoverage = this.StoreAllResponse.device.warrantyInfo.onsiteCoverage;
          this.product.LaborCovered = this.StoreAllResponse.device.warrantyInfo.laborCovered;
          this.product.PartCovered = this.StoreAllResponse.device.warrantyInfo.partCovered;
          this.product.PurchaseCountryDesc = this.StoreAllResponse.device.warrantyInfo.purchaseCountryDesc;
          this.product.DeviceCoverageDetails = this.StoreAllResponse.device.warrantyInfo.deviceCoverageDetails;
          this.product.PurchaseCountryCode = this.StoreAllResponse.device.warrantyInfo.purchaseCountryCode
          this.product.SoldToName = this.StoreAllResponse.device.soldToName;
          this.product.PurchaseDate = this.StoreAllResponse.device.warrantyInfo.purchaseDate
          console.log("PurchaseDate", this.product.PurchaseDate)
          this.checkPartCover()
          this.checkLaborCover()
          this.DateCalculate()
          this.checkCoverageCover()
          this.get_Component_Issue();
          this.SetBanckValue1();
          this.SetBanckValue2();
          this.SetBanckValue3();
          this.PurchaseCountryDesc()
          this.CoverageStartDate();
          this.oldToName();
          this.CoverageEndDate()
          if (this.product.ProductDescription == 'Non-serialized Products' && this.product.ProductTypeValues != 'NONSERIALIZED') {
            this.toasty.error("Please Select Product Type = Non-Serialised ");
            this.product.ProductTypeValues = 'NONSERIALIZED'
            this.Set_Non_Serialised()
          }
          if (this.product.ProductDescription != 'Non-serialized Products' && this.product.ProductTypeValues == 'NONSERIALIZED') {
            this.toasty.error("Please Select Product Type = Serialised ");
            this.product.ProductTypeValues = 'SERIALIZED'
          }

        }
      });
  }

  validateCard(){
    if ( this.product.MembershipCardNo == null || this.product.MembershipCardNo == undefined ||  this.product.MembershipCardNo== '') {
      this.toasty.error("Enter valid card no!");
      return;
    }
    if ( this.product.SecurityNo == null || this.product.SecurityNo == undefined ||  this.product.SecurityNo== '') {
      this.toasty.error("Enter valid CVV!");
      return;
    }
    
    let strQuestion = [];
    strQuestion.push({
      "Key": "ApiType",
      "Value": "ValidateCardDetails"
    });
    strQuestion.push({
      "Key": "MembershipCardNo",
      "Value": this.product.MembershipCardNo
    });
    strQuestion.push({
      "Key": "SecurityNo",
      "Value": this.product.SecurityNo
    });

    let strRequestData = JSON.stringify(strQuestion);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {

        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          let data = JSON.parse(response.ExtraData);
          if (data.Totalrecords == 0) {           
            this.toasty.error("Invalid Card Details, try again!")
          }
          else{
            this.toasty.success("Card Details validated successfully!")
          }
        } else {

        }
      },
    });
    // if(this.product.MembershipCardNo!= undefined && this.product.MembershipCardNo!= null && this.product.MembershipCardNo!= ''){
    //   let membershipCardNo = this.product.MembershipCardNo.toString().trim();
    //   if(membershipCardNo.length!= 10){
    //     this.toasty.error("Membership Card No must be 10 digits");
    //     return false;
    //   }
    //   if(!membershipCardNo.match(/^[0-9]+$/)){
    //     this.toasty.error("Membership Card No must be numeric");
    //     return false;
    //   }
    // }
  }
  //[1]Imei
  storeVal1;
  ImeiSetNullVal = "";
  // 1st set black values
  SetBanckValue1() {
    if (this.product.Imei == undefined) {
      this.storeVal1 = this.ImeiSetNullVal;
    }

  }

  // 2st set black values
  storeVal2;
  MeidSetBlackValues = "";
  SetBanckValue2() {
    if (this.product.Meid == undefined) {
      this.storeVal2 = this.MeidSetBlackValues;
    }
  }
  // 3rd set black values
  BlackVal1 = "";
  storeVal3;
  SetBanckValue3() {
    if (this.product.PurchaseCountryCode == undefined) {
      this.storeVal3 = this.BlackVal1;
    }
  }

  // 4rth set black values
  BlackVal2 = "";
  storeVal4;
  PurchaseCountryDesc() {
    if (this.product.PurchaseCountryDesc == undefined) {
      this.storeVal4 = this.BlackVal2;
    }

  }

  BlackVal3 = "";
  storeVal5;

  // 5th set black values

  CoverageStartDate() {
    if (this.product.CoverageStartDate == undefined) {
      this.storeVal5 = this.BlackVal3;
    }
  }

  BlackVal4 = "";
  storeVa16;

  // 6th
  CoverageEndDate() {
    if (this.product.CoverageEndDate == undefined) {
      this.storeVa16 = this.BlackVal4;
    }
    else {
      console.log(this.product.CoverageEndDate == this.product.CoverageEndDate);
      this.storeVa16 = this.product.CoverageEndDate
    }
  }
  BlackVa15 = "";
  storeVa17;

  // 7th
  oldToName() {
    if (this.product.SoldToName == undefined) {
      this.storeVa17 = this.BlackVa15;
    }
  }
  days: number
  day1: any
  day2: any
  DateCalculate() {

    if (this.product.PurchaseDate == undefined || this.product.PurchaseDate == null) {
      this.appleCare = 'Not Eligible'
    }
    else {
      this.day1 = new Date(this.product.PurchaseDate).toISOString().split('T')[0];
      this.day2 = new Date().toISOString().split('T')[0];
      let date1 = new Date(this.day1);
      let date2 = new Date(this.day2);
      this.days = (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
      this.AppleCareEligileStatus()
    }
  }

  appleCare = ""
  AppleCareEligileStatus() {
    if (this.days <= 60) {
      this.appleCare = 'Eligible'
      this.toasty.info("Eligible For Apple Care")
    } else {
      this.appleCare = 'Not Eligible'
    }
  }

  NextPage1() {
    this.dynamicService.validateAllFormFields(this.secondFormGroup);
    if (this.secondFormGroup.valid) {
      this.errorMessage = "";
    }
    else {
      console.log("Error in valid");
    }
  }


  checkvalidation(response: any) {
    
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    let validationMessage = errror[0]
    if (validationMessage.includes("Tag Already Created For Serial No")) {
      this.toasty.error("Serial number Already Exist")
    }
  }


  onELSStatusSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ELSStatus, $event.term, {
      JobType: this.callForm.toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ELSStatusType = value;
        }
      },
      error: (err) => {
        this.ELSStatusType = this.getBlankObject();
      }
    });
  }


  onProductType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductType, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductType1 = value;
          console.log("Product Type", this.ProductType1)
          if ( this.DocType == 'snr'){
            this.product.ProductTypeValues = 'SERIALIZED'
            this.secondFormGroup.patchValue({
              ProductTypeValues: 'SERIALIZED'
            })
          }
        }
      },
      error: (err) => {
        this.ProductType1 = this.getBlankObject();
      }
    });
  }
  partCover = ""
  laborCover = ""
  onSiteCoverage = ""
  checkLaborCover() {
    if (this.product?.LaborCovered == undefined || this.product?.LaborCovered == false) {
      this.laborCover = 'Not Eligible'
    } else {
      this.laborCover = 'Eligible'
    }
  }

  checkPartCover() {
    if (this.product?.PartCovered == undefined || this.product?.PartCovered == false) {
      this.partCover = 'Not Eligible'
    } else {
      this.partCover = 'Eligible'
    }
  }

  checkCoverageCover() {
    if (this.product?.OnsiteCoverage == undefined || this.product?.OnsiteCoverage == false) {
      this.onSiteCoverage = 'Not Eligible'
    } else {
      this.onSiteCoverage = 'Eligible'
    }
  }

  NextPage2() {
    this.dynamicService.validateAllFormFields(this.thirdFormGroup);
    if (this.thirdFormGroup.valid) {
      this.errorMessage = "";
    }
    else {
      console.log("Error in valid");
    }
  }

  // location code

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          console.log("location code")
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }


  onLocationSelect(event) { }
  Checklist_Master(productdescription) {

    let strQuestion = [];
    strQuestion.push({
      "Key": "ApiType",
      "Value": "GetCheckListDetails"
    });
    strQuestion.push({
      "Key": "Stage",
      "Value": "JOBCREATE"
    });
    strQuestion.push({
      "Key": "ProductName",
      "Value": productdescription
    });

    let strRequestData = JSON.stringify(strQuestion);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {

        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          let checklistdata = JSON.parse(response.ExtraData);
          this.checklistTotalvalues = [];
          if (checklistdata.Totalrecords == 0) {
            this.isAddProductButtonShow = true;
            this.toasty.info("Please Add Product")
          }
          if (Array.isArray(checklistdata.CheckListDetails.CheckList)) {
            this.checklistTotalvalues = checklistdata.CheckListDetails.CheckList;
          }
          else {
            this.checklistTotalvalues.push(checklistdata.CheckListDetails.CheckList);
          }


          var Cnt = 0;

          for (let item of this.checklistTotalvalues) {
            // let controlNamee = item.ChecklistDescription.toString()
            item.formControlName = "Question" + Cnt.toString();
            item.arrFldValue = this.splitAndformat(item.FldValue);
            item.defaultvalue = item.DefaultValue.trim();
            item.answer = item.defaultvalue.trim();
            var iscontrolexists = this.thirdFormGroup.controls[item.formControlName] == undefined ? 0 : 1;

            if (iscontrolexists == 0) {
              this.thirdFormGroup.addControl(item.formControlName, new FormControl());
            }
            Cnt = Cnt + 1;
          }

        } else {

        }
      },
    });
  }

  splitAndformat(tags: any) {
    var arr = [];
    for (let item of tags.split(",")) {
      arr.push({ label: item.trim(), value: item.trim() });
    }
    return arr;
  }


  getQuestionObject() {
    Object.keys(this.thirdFormGroup.controls).forEach(field => {
      if (field == "component" || field == "issues") {
      }
      else {
        this.controlName = field.toString()
        this.answer = this.thirdFormGroup.get(field).value

        this.dictData[this.controlName] = this.answer
        this.dictArr.push(this.dictData)
      }
    })
  }

  ConvertObjectIntoXml() {

    let rawData = {
      "rows": []
    }
    for (let item of this.checklistTotalvalues) {

      var questions = item.ChecklistDescription;
      var answer = item.answer;

      rawData.rows.push({
        "row": {
          "question": questions,
          "answer": answer
        }
      });
    }

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;

  }

  snrCheckListXml() {

    let rawData = {
      "rows": []
    }
    rawData.rows.push({
      "row": {
        "question": '',
        "answer": ''
      }
    });

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;

  }

  color = 'black'
  getTextValue() {
    if (this.product.ElsStatus != null || this.product.ElsStatus != undefined) {
      for (let item of this.ELSStatusType.Data) {
        if (item.Id == this.product.ElsStatus) {
          this.elsStatusTextValue = item.TEXT
          break;
        }
      }

    }
  }
  // Save customer Job  
  Save_Job_Details() {
    if (this.frontImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if (this.backImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if (this.topImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if (this.bottomImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if (this.leftImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if (this.rightImageList.length != 0) {
      this.imageListArray.push(this.frontImageList)
    }

    if ( this.DocType == 'snr'){
      var isValid = this.controlSVNRValidations();
      if (isValid == false) {
        return;
      }
    }
    else{
      var isValid = this.controlValidations();
      if (isValid == false) {
        return;
      }
    }

    if (isValid == true) {
      //If all Valid popup Open
      this.isverificationPopup = true;


      if ( this.DocType == 'snr'){
        return
      }
      // All Question answer push
      for (let item of this.checklistTotalvalues) {
        // ;
        var questions = item.ChecklistDescription;

        var answer = item.answer;

        /*****/
        this.questionArray.push(item);
        // this.answerArray.push(answer);

        if (answer == null || answer == undefined || answer == "") {
          this.toasty.error("Checklist " + questions + " can not be blank");
          isValid = false;
          break;
        }
      }
    }

  }

  verificationSubmit($event) {
    this.isVerification = $event;

    if (this.isVerification == true) {
      const secondform = this.secondFormGroup.value
      
      let RequestAddProduct = [];
      RequestAddProduct.push({
        "Key": "ApiType",
        "Value": "SaveJobDetails"
      });
      RequestAddProduct.push({
        "Key": "ReservationGUID",
        "Value": this.ReservationGUID == undefined || this.ReservationGUID == null ? '00000000-0000-0000-0000-000000000000' : this.ReservationGUID
      })
      RequestAddProduct.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      RequestAddProduct.push({
        "Key": "JobType",
        "Value": this.product.ServiceType,
      });
     RequestAddProduct.push({
        "Key": "TokenNumber",
        "Value": this.ReservationCode ? '' : this.queryData.tc,
      });
      RequestAddProduct.push({
        "Key": "TokenDate",
        "Value":this.ReservationCode ? '1900-01-01' : this.queryData.td,
      });
      RequestAddProduct.push({
        "Key": "CounterNumber",
        "Value": this.ReservationCode ? '' : this.queryData.cn,
      });
      RequestAddProduct.push({
        "Key": "PRODUCTTYPE",
        "Value": this.product.ProductTypeValues,
      });
      RequestAddProduct.push({
        "Key": "SerialNo1",
        "Value": this.product.SerialNo.toUpperCase(),
      });
      RequestAddProduct.push({
        "Key": "imei",
        "Value": this.product.Imei == null || this.product.Imei == undefined ? "" : this.product.Imei
      });
      RequestAddProduct.push({
        "Key": "TableReplacement",
        "Value": this.product.TableReplacement == null || this.product.TableReplacement == undefined? "NO" : this.product.TableReplacement,
      });
      RequestAddProduct.push({
        "Key": "PartnerList",
        "Value": this.product.PartnerList == null || this.product.PartnerList == undefined? "" : this.product.PartnerList,
      });
      
      RequestAddProduct.push({
        "Key": "DataBackup",
        "Value": this.product.DataBackup == null || this.product.DataBackup == undefined? "NO" : this.product.DataBackup,
      });
      RequestAddProduct.push({
        "Key": "meid",
        "Value": this.product.Meid == null || this.product.Meid == undefined ? "" : this.product.Meid
      });
      RequestAddProduct.push({
        "Key": "productDescription",
        "Value": this.product.ProductDescription == undefined ? "" : this.product.ProductDescription
      });
      RequestAddProduct.push({
        "Key": "RetailCustomerCode",
        "Value": this.CustomerCode1
      });
      RequestAddProduct.push({
        "Key": "LocationCode",
        "Value": this.LocationCode
      });
      RequestAddProduct.push({
        "Key": "ConfigurationCode",
        "Value": this.product.ConfigCode == undefined ? "" : this.product.ConfigCode
      });
      RequestAddProduct.push({
        "Key": "ConfigurationDescription",
        "Value": this.product.ConfigDescription == undefined ? "" : this.product.ConfigDescription
      });
      RequestAddProduct.push({
        "Key": "PurchaseCountryCode",
        "Value": this.product.PurchaseCountryCode == null || this.product.PurchaseCountryCode == undefined ? "" : this.product.PurchaseCountryCode
      });
      RequestAddProduct.push({
        "Key": "PurchaseCountryDesc",
        "Value": this.product.PurchaseCountryDesc == null || this.product.PurchaseCountryDesc == undefined ? "" : this.product.PurchaseCountryDesc

      });
      RequestAddProduct.push({
        "Key": "SoldToName",
        "Value": this.product.SoldToName == null || this.product.SoldToName == undefined ? "" : this.product.SoldToName
      });
      // pending
      RequestAddProduct.push({
        "Key": "ActivationDate",
        "Value": this.product.FirstActivationDate == undefined ? "" : this.product.FirstActivationDate

      });
      RequestAddProduct.push({
        "Key": "POPDate",
        "Value": this.product.PopDate == undefined ? "" : this.product.PopDate
      });
      RequestAddProduct.push({
        "Key": "CoverageStartDate",
        "Value": this.product.CoverageStartDate == undefined || this.product.CoverageStartDate == null ? null : this.product.CoverageStartDate

      });
      RequestAddProduct.push({
        "Key": "CoverageEndDate",
        "Value": this.storeVa16 == undefined ? "" : this.storeVa16
      });
      RequestAddProduct.push({
        "Key": "GSXWarrantyStatusCode",
        "Value": this.product.GsxWarrantyStatusCode == undefined ? "" : this.product.GsxWarrantyStatusCode

      });
      RequestAddProduct.push({
        "Key": "GSXWarrantyStatusDesc",
        "Value": this.product.GsxWarrantyStatusDescription == undefined ? "" : this.product.GsxWarrantyStatusDescription
      });
      RequestAddProduct.push({
        "Key": "deviceCoverageDetails",
        "Value": this.product.DeviceCoverageDetails == undefined ? "" : Array.isArray(this.product.DeviceCoverageDetails) ? this.product.DeviceCoverageDetails.toString() : this.product.DeviceCoverageDetails
      });
      RequestAddProduct.push({
        "Key": "ProductImageURL",
        "Value": this.product.ImageUrl == undefined ? "" : this.product.ImageUrl

      });
      RequestAddProduct.push({
        "Key": "ElsStatus",
        "Value": this.product.ElsStatus == undefined ? "" : this.product.ElsStatus
      });
      //pending 
      RequestAddProduct.push({
        "Key": "ComplainDesc",
        "Value": this.product.CustomerVoice == undefined ? "" : this.product.CustomerVoice
      });
      // pending
      RequestAddProduct.push({
        "Key": "Remark",
        "Value": this.product.CREVoice == undefined || this.product.CREVoice == null ? "" : this.product.CREVoice
        // this.product.CustomerVoice,
        
      });
        RequestAddProduct.push({
          "Key": "CustomerCompanyName",
          "Value": this.product.CustomerCompanyName == null || this.product.CustomerCompanyName == undefined ? "" : this.product.CustomerCompanyName
        });
        RequestAddProduct.push({
          "Key": "EstimatedServiceCharges",
          "Value": this.product.EstimatedServiceCharges == null || this.product.EstimatedServiceCharges == undefined ? 0 : this.product.EstimatedServiceCharges
        });
        RequestAddProduct.push({
          "Key": "MembershipCardNo",
          "Value": this.product.MembershipCardNo == null || this.product.MembershipCardNo == undefined ? '' : this.product.MembershipCardNo
        });
        RequestAddProduct.push({
          "Key": "SecurityNo",
          "Value": this.product.SecurityNo == null || this.product.SecurityNo == undefined ? '' : this.product.SecurityNo
        });
        RequestAddProduct.push({
          "Key": "EstimatedPartsCost",
          "Value": this.product.EstimatedPartsCost == null || this.product.EstimatedPartsCost == undefined ? 0 : this.product.EstimatedPartsCost
        });  
        RequestAddProduct.push({
          "Key": "PouchNo",
          "Value": this.product.PouchNo == null || this.product.PouchNo == undefined  ? '' : this.product.PouchNo
        });

      RequestAddProduct.push({
        "Key": "Attachment",
        "Value": this.getImagePath()
      });

      // RequestAddProduct.push({
      //   "Key": "ComponentIssue",
      //   "Value": this.getComponentIssueXml(),
      // });
      //pending 
      RequestAddProduct.push({
        "Key": "JobStatus",
        "Value": "S01"
      });
      RequestAddProduct.push({
        "Key": "laborCovered",
        "Value": this.product.LaborCovered == false || this.product.LaborCovered == undefined ? 0 : 1
      });
      RequestAddProduct.push({
        "Key": "partCovered",
        "Value": this.product.PartCovered == false || this.product.PartCovered == undefined ? 0 : 1

      });
      RequestAddProduct.push({
        "Key": "BillingOption",
        "Value": this.product.BillingOptions

      });

      //Quetions 
      RequestAddProduct.push({
        "Key": "JobChecklistDetails",
        "Value": this.DocType== 'snr' ? this.snrCheckListXml() : this.ConvertObjectIntoXml()
      });
       // ReferredBy
      RequestAddProduct.push({
        "Key": "ReferredBy",
        "Value": ''
      });
      RequestAddProduct.push({
        "Key": "CustomerVisitSource",
        "Value": this.activatedRoute.snapshot.queryParams.CVS == null || this.activatedRoute.snapshot.queryParams.CVS == undefined ? '' :this.activatedRoute.snapshot.queryParams.CVS
      });
      RequestAddProduct.push({
        "Key": "CustomerSourceName",
        "Value": this.activatedRoute.snapshot.queryParams.CSN == null || this.activatedRoute.snapshot.queryParams.CSN == undefined ? '' :this.activatedRoute.snapshot.queryParams.CSN
      });
   // contract
         RequestAddProduct.push({
        "Key": "IsContractApplicable",
        "Value": this.ContractCode == null || this.ContractCode == '' || this.ContractCode == undefined ? "0" : "1"
      });
  
      RequestAddProduct.push({
        "Key": "ContractCode",
        "Value": this.ContractCode == null ||  this.ContractCode == undefined ? '' : this.ContractCode
      });
      RequestAddProduct.push({
        "Key": "ContractStartDate",
        "Value": this.ContractStartDate == null ||this.ContractStartDate == undefined ? '1900-01-01' : this.ContractStartDate
       });
      RequestAddProduct.push({
        "Key": "ContractEndDate",
        "Value": this.ContractEndDate == null ||this.ContractEndDate == undefined ? '1900-01-01' : this.ContractEndDate
      });

      let strRequestData = JSON.stringify(RequestAddProduct);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Request ", RequestAddProduct)
      // alert("Return on ")
      // return
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toasty.success("Form Submitted Successfully")
            var result = JSON.parse(response.ExtraData);
            let CaseGUID = result.CaseGUID;
            let CaseId = result.CaseId;
            
            this.saveCasaJobLead(CaseGUID) 
            this.TokenStatusChange()
            this.route.navigateByUrl('auth/' + glob.CompanyCode + '/repair-process?guid=' + CaseGUID)
  
            // if (this.DocType == 'snr'){
            //   this.onSaveNotes( CaseGUID , CaseId)
            // }
            // else{
            //   this.TokenStatusChange()
            //   this.route.navigateByUrl('auth/' + glob.CompanyCode + '/repair-process?guid=' + CaseGUID)
            // }
          }
          else {
            
            this.errorMessage = response.ReturnMessage;
            console.log("Error ", response)
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.checkvalidation(response)
            });

            let errorMessage = response.ErrorMessage;
            const parser2 = new xml2js.Parser({ strict: false, trim: true });
            parser2.parseString( errorMessage , (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
              console.log("Messages : " ,errorMessages)
              errorMessages.forEach((errorMessage) => {
                console.log("Error Message: " , error)
                this.toasty.error(errorMessage.ERRORMESSAGE);
              });
            });  
          }
        },
        error: err => {
          console.log(err)
        }

      });


      this.isverificationPopup = false;
    }
    else {
      return;

    }

  }

  saveCasaJobLead(data) {
    
    try{
      let obj = {
        CaseGUID: data
      };
      let strRequestData = JSON.stringify(obj);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("obj", obj);
      this.dynamicService.saveCasaJobLead(contentRequest).subscribe(
        {
          next: (value) => {
            
            let response = JSON.parse(value.toString());
            ;
            if (response.code == '0') {
              this.toasty.info("" , "Posted to Casa successfully!", { closeButton: true, disableTimeOut: true });
            }
            else {
              
              let errorMessage = response;
              this.toasty.error( errorMessage.message, "Error While Posting to Casa:-", { closeButton: true, disableTimeOut: true });
            }
          },
          error: err => {
            
            this.ngxSpinnerService.hide()
            this.toasty.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
            console.log(err);
          }
        });
    }
    catch (err){
      this.toasty.error( err , "Error:-", { closeButton: true, disableTimeOut: true });
    }
  }
  
  onSaveNotes(caseGUID , caseId) {
    this.ngxSpinnerService.show();
    let newNotesGuid = uuidv4();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveNotes"
    });
    requestData.push({
      "Key": "NoteType",
      "Value": 'Technician'
    });
    // Remove Special Characters from Notes 
    // this.selectedTemp = this.selectedTemp.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    requestData.push({
      "Key": "Notes",
        "Value": this.product.TechnicianRemark == null || this.product.TechnicianRemark == undefined ? '' : this.product.TechnicianRemark
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "NotesGuid",
      "Value": newNotesGuid
    });
    requestData.push({
      "Key": "CaseID",
      "Value": caseId
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": caseGUID
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
            
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");               
            this.TokenStatusChange()
            this.route.navigateByUrl('auth/' + glob.CompanyCode + '/repair-process?guid=' + caseGUID)
          }
          else {

            this.errorMessage = response.ReturnMessage;

            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;

            });
          }
        },
        error: err => {
          console.log(err);
        }
      });


  }

  


  TokenStatusChange() {
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
      "Value": this.queryData.tc
    });
    RequestStatus.push({
      "Key": "TokenStatus",
      "Value": "CLOSED"
    });
    RequestStatus.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
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


  checklistvaluechange(item, item1) {
    ;
    item.answer = item1.value;
  }


  resetFormdata() {
    this.firstFormGroup.reset();

  }

  ResetSecondFormdata() {

    this.product = null;
    this.product = new AddProduct();
    this.secondFormGroup.reset()



  }
  buttontest() {
    this.product.ProductTypeValues

  }

  AddSaveproduct() {
    this.NextPage1();
    // this.isSubmitBtnDisabled = false;

  }


  item2 = []


  goBack(stepper: MatStepper) {
    ;
    console.log(stepper.selectedIndex)
    stepper.previous();
  }

  goForward(stepper: MatStepper) {
    this.verificationList = {
      CustomerCode1: this.CustomerCode1,

      callType: this.product.ServiceType,
      productType: this.product.ProductTypeValues,
      BillingOptions: this.product.BillingOptions,
      LocationCode: this.LocationCode,
      ElsStatus: this.elsStatusTextValue,
      CustomerVoice: this.product.CustomerVoice,
      CREVoice: this.product.CREVoice,
      CustomerCompanyName: this.product.CustomerCompanyName,
      EstimatedServiceCharges: this.product.EstimatedServiceCharges,
      PartnerList: this.product.PartnerList,
      MembershipCardNo: this.product.MembershipCardNo,
      SecurityNo: this.product.SecurityNo,
      EstimatedPartsCost: this.product.EstimatedPartsCost,
      PouchNo : this.product.PouchNo,
      TechnicianRemark : this.product.TechnicianRemark,
      Date: this.DatePicker,
      ProductDescription: this.product.ProductDescription,

      serialNo: this.product.SerialNo,
      GsxWarrantyStatusDescription: this.product.GsxWarrantyStatusDescription,
      laborCover: this.laborCover,
      configDesc: this.product.ConfigDescription,
      productName: this.product.ProductDescription,
      onsitecoverage: this.onSiteCoverage,
      purchaseCountry: this.product.PurchaseCountryDesc,
      appleCare: this.appleCare,
      partCover: this.partCover,

    }
    

    console.log(stepper.selectedIndex)
    var isvalid = false;
    if ( this.DocType != 'snr'){
      if (stepper.selectedIndex == 0) {
        isvalid = this.validateCustomerForm()
      }
      else if (stepper.selectedIndex == 1) {
        isvalid = this.validateProductForm()
      }
    }
    else{
      if (stepper.selectedIndex == 0) {
        isvalid = this.validateCustomerForm()
      }
      else if (stepper.selectedIndex == 1) {
        isvalid = this.validateSVNRProductForm()
      }
    }

    if (isvalid == true) {
      stepper.next();
    }
  }

  validateCustomerForm() {
    if (this.CustomerCode1 == "" || this.CustomerCode1 == null || this.CustomerCode1 == undefined) {
      this.toasty.error("Customer does not exist. please select valid customer");
      return false;
    }
    return true;
  }

  Cancel($event) {
    this.isdiagnosticPop = $event
    this.isverificationPopup = $event
  }


  validateProductForm() {
    var isValid = false;

    if (this.product.ServiceType == '' || this.product.ServiceType == null || this.product.ServiceType == undefined) {
      this.toasty.error("Please Select Service Type .");
      return false;
    }

    if (this.product.ProductTypeValues == '' || this.product.ProductTypeValues == null || this.product.ProductTypeValues == undefined) {
      this.toasty.error("Please Select Type Of Product .");
      return false;
    }
 
    if (this.product.SerialNo == '' || this.product.SerialNo == null || this.product.SerialNo == undefined) {
      this.toasty.error("please enter serial no and search");
      return false;
    }
    if (this.product.ProductDescription == '' || this.product.ProductDescription == null || this.product.ProductDescription == undefined) {
      this.toasty.error("Invalid Product . please enter serial no and search");
      return false;
    }

    if (this.product.BillingOptions == '' || this.product.BillingOptions == null || this.product.BillingOptions == undefined) {
      this.toasty.error("Please Select Billing Option .");
      return false;
    }


    if (this.LocationCode == '' || this.LocationCode == null || this.LocationCode == undefined) {
      this.toasty.error("Please Select Location .");
      return false;
    }
    if (this.product.ElsStatus == '' || this.product.ElsStatus == null || this.product.ElsStatus == undefined) {
      this.toasty.error("please select valid Els Status");
      return false;
    }

    if ( this.product.EstimatedServiceCharges == null || this.product.EstimatedServiceCharges == undefined) {
      this.toasty.error("Estimated service charges Can not be empty");
      return false;
    }
    
    if ( this.product.PartnerList == null || this.product.PartnerList == undefined) {
      this.toasty.error("Device purchased from - can not be empty");
      return false;
    }
    
    if ( this.product.MembershipCardNo != null && this.product.MembershipCardNo != undefined && this.product.MembershipCardNo != undefined && this.product.MembershipCardNo != '') {
      if ( this.product.SecurityNo == null || this.product.SecurityNo == undefined ){
        this.toasty.error("CVV cant be empty!");
        return false;
      }
    }
    if ( this.product.EstimatedPartsCost == null || this.product.EstimatedPartsCost == undefined) {
      this.toasty.error("Estimated Parts cost Can not be empty");
      return false;
    }
    if ( this.product.EstimatedPartsCost < 0|| this.product.EstimatedServiceCharges < 0 ) {
      this.toasty.error("Estimated prices can not be negative");
      return false;
    }
    if (this.product.CustomerVoice == '' || this.product.CustomerVoice == null || this.product.CustomerVoice == undefined) {
      this.toasty.error("Customer Voice Can not be blank .");
      return false;
    }
    if (this.product.CREVoice == '' || this.product.CREVoice == null || this.product.CREVoice == undefined) {
      this.toasty.error("CRE Voice Can not be blank .");
      return false;
    }
    return true;
  }

  validateSVNRProductForm() {
    var isValid = false;

    if (this.product.ServiceType == '' || this.product.ServiceType == null || this.product.ServiceType == undefined) {
      this.toasty.error("Please Select Service Type .");
      return false;
    }

    if (this.product.ProductTypeValues == '' || this.product.ProductTypeValues == null || this.product.ProductTypeValues == undefined) {
      this.toasty.error("Please Select Type Of Product .");
      return false;
    }

    if (this.product.SerialNo == '' || this.product.SerialNo == null || this.product.SerialNo == undefined) {
      this.toasty.error("please enter serial no and search");
      return false;
    }
    if (this.product.ProductDescription == '' || this.product.ProductDescription == null || this.product.ProductDescription == undefined) {
      this.toasty.error("Invalid Product . please enter serial no and search");
      return false;
    }

    if (this.product.BillingOptions == '' || this.product.BillingOptions == null || this.product.BillingOptions == undefined) {
      this.toasty.error("Please Select Billing Option .");
      return false;
    }
    if (this.LocationCode == '' || this.LocationCode == null || this.LocationCode == undefined) {
      this.toasty.error("Please Select Location .");
      return false;
    }
    if (this.product.ElsStatus == '' || this.product.ElsStatus == null || this.product.ElsStatus == undefined) {
     this.product.ElsStatus = ''
    }
    if ( this.product.EstimatedServiceCharges == null || this.product.EstimatedServiceCharges == undefined) {
      this.toasty.error("Estimated service charges Can not be empty");
      return false;
    }
    if ( this.product.PartnerList == null || this.product.PartnerList == undefined) {
      this.toasty.error("Device purchased from - can not be empty");
      return false;
    }
    if ( this.product.MembershipCardNo != null && this.product.MembershipCardNo != undefined && this.product.MembershipCardNo != undefined && this.product.MembershipCardNo != '') {
      if ( this.product.SecurityNo == null || this.product.SecurityNo == undefined ){
        this.toasty.error("CVV cant be empty!");
        return false;
      }
    }

    if ( this.product.EstimatedPartsCost == null || this.product.EstimatedPartsCost == undefined) {
      this.product.EstimatedPartsCost = 0
    }
    // if ( this.product.EstimatedPartsCost < 0|| this.product.EstimatedServiceCharges < 0 ) {
    //   this.toasty.error("Estimated prices can not be negative");
    //   return false;
    // }
    if (this.product.CustomerVoice == '' || this.product.CustomerVoice == null || this.product.CustomerVoice == undefined) {
      this.toasty.error("Customer Voice Can not be blank .");
      return false;
    }
    if (this.product.CREVoice == '' || this.product.CREVoice == null || this.product.CREVoice == undefined) {
      this.toasty.error("CRE Voice Can not be blank .");
      return false;
    }
    // if (this.product.TechnicianRemark == '' || this.product.TechnicianRemark == null || this.product.TechnicianRemark == undefined) {
    //   this.toasty.error("Technician Remark Can not be blank .");
    //   return false;
    // }
    return true;
  }

  SignatureShow = "";
  isAddSignatureShow: boolean = false;
  isAddSignature: boolean = true;

  jobCreateSignature($event) {
    this.SignatureFileName = $event
    console.log('Signature', this.SignatureFileName)
    this.SignatureShow = this.SignatureFileName.toString() // "http://carecrm.iplanet.one/nitcgsxapi/" + this.SignatureFileName
  }

  authorizationValidate($event) {
    this.AuthSignatureFileName = $event
    console.log('Signature', this.AuthSignatureFileName)
    this.SignatureShow = this.AuthSignatureFileName.toString() //  "http://carecrm.iplanet.one/nitcgsxapi/" + this.AuthSignatureFileName
  }

  // showSignature() {
  //   if (this.isAddSignatureShow == true) {
  //     this.isAddSignatureShow = false;
  //     this.isAddSignature = true;
  //   } else {
  //     this.isAddSignatureShow = true;
  //     this.isAddSignature = false;
  //   }
  // }

  CloseEvent($event) {
    this.isSignature = $event
  }

  selDetailDeviceCondition() {
    this.DetailConditions = []


    if (this.product.ElsStatus == "DC01") {
      this.DetailConditions.push({
        "DetailConditionsCode": "01",
        "DetailConditionsDescription": "Screen cracked/ glass broken"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "02",
        "DetailConditionsDescription": "Chipped/cracked outside display area"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "03",
        "DetailConditionsDescription": "More than 2 scratches on screen"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "04",
        "DetailConditionsDescription": "1-2 scratches on screen"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "05",
        "DetailConditionsDescription": "Receiver/Grille damage"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "06",
        "DetailConditionsDescription": "Other"
      })
    }

    if (this.product.ElsStatus == "EC01") {
      this.DetailConditions.push({
        "DetailConditionsCode": "01",
        "DetailConditionsDescription": "More than 2 scratches"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "02",
        "DetailConditionsDescription": "1-2 scratches"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "03",
        "DetailConditionsDescription": "No dents"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "04",
        "DetailConditionsDescription": "Bent/ curved panel"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "05",
        "DetailConditionsDescription": "Loose screen (Gap in screen and body)"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "06",
        "DetailConditionsDescription": "Microphone damage"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "07",
        "DetailConditionsDescription": "Speaker damage"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "08",
        "DetailConditionsDescription": "Other"
      })
    }

    if (this.product.ElsStatus == "RC01") {
      this.DetailConditions.push({
        "DetailConditionsCode": "01",
        "DetailConditionsDescription": "Cracked/ broken side or back panel"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "02",
        "DetailConditionsDescription": "Missing side or back panel"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "03",
        "DetailConditionsDescription": "No defect on side or back panel"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "04",
        "DetailConditionsDescription": "Other"
      })
    }

    if (this.product.ElsStatus == "PI01") {
      this.DetailConditions.push({
        "DetailConditionsCode": "01",
        "DetailConditionsDescription": "Missing security screws"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "02",
        "DetailConditionsDescription": "Missing LCIs"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "03",
        "DetailConditionsDescription": "Stripped security screws"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "04",
        "DetailConditionsDescription": "Missing SIM tray"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "05",
        "DetailConditionsDescription": "Mismatch SIM tray"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "06",
        "DetailConditionsDescription": "Triggered LCIs"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "07",
        "DetailConditionsDescription": "Externally visible display adhesive"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "08",
        "DetailConditionsDescription": "Liquid Damage"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "09",
        "DetailConditionsDescription": "Physical Damage"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "10",
        "DetailConditionsDescription": "Defaced Serial Number"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "11",
        "DetailConditionsDescription": "Non-Apple Battery"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "12",
        "DetailConditionsDescription": "Non-Apple Display"
      })
      this.DetailConditions.push({
        "DetailConditionsCode": "13",
        "DetailConditionsDescription": "Other"
      })
    }

    console.log("Data", this.DetailConditions)
  }

  addcosmeticWithCondition: any[] = []

  Data

  addCosmeticANDCondition() {
    this.addcosmeticWithCondition.push({
      "CosmeticDescription": this.product.ElsStatus,
      "DetailCondition": this.Data
    })
    console.log("Data", this.addcosmeticWithCondition)
  }

  diagnosisOpen() {
    this.isdiagnosticPop = true;
  }



 onBindAmcContractDetails($event: { term: string; item: any[] },SerialNo) {
   
    this.dropdownDataService.fetchDropDownData(DropDownType.BindAmcContractDetails, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      SerialNo : SerialNo,
      CustomerCode : this.activatedRoute.snapshot.queryParams.nc
    }).subscribe({
      next: (value) => {
        if (value != null) {

          this.BindAmcContractDetailsDD = value;
          console.log('BindAmcContractDetailsDD', this.BindAmcContractDetailsDD);
        }
      },
      error: (err) => {
        this.BindAmcContractDetailsDD = DropDownValue.getBlankObject();
      }
    });
  }

onAmcContractDetailsChange(ContractCode){
    
   const selectedContract =  this.BindAmcContractDetailsDD?.Data.find(item=>item.Id === ContractCode)
   console.log('selContract',selectedContract)
   const startdate = selectedContract?.extraDataJson?.Data?.CoverageStartDate[0]
   const enddate =  selectedContract?.extraDataJson?.Data?.CoverageEndDate[0]
     this.ContractStartDate = this.datePipe.transform(startdate, 'yyyy-MM-dd')
     this.ContractEndDate = this.datePipe.transform(enddate, 'yyyy-MM-dd')


}

  

}
