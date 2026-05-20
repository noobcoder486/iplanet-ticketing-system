import { Component, EventEmitter, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from "../../config/global";
import { RepairViewComponent } from './repair-view/repair-view.component';
import { Observable } from 'rxjs/internal/Observable';
import { CaseDetail } from './repair-process.metadata';
import { NotesComponent } from './notes/notes.component';
import { PaymentComponent } from './payment/payment.component';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, SwiperOptions, Autoplay, Thumbs, Virtual, Zoom, Controller, Swiper, Mousewheel } from 'swiper';
import { HandOverComponent } from './hand-over/hand-over.component';
import { ReadyToPickupComponent } from './ready-to-pickup/ready-to-pickup.component';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InvoiceComponent } from './invoice/invoice.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { SwiperComponent } from "swiper/angular";
import { QuoteViewComponent } from './quote-view/quote-view.component';
import xml2js from 'xml2js';
import { FeedbackComponent } from './feedback/feedback.component';

SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
  Mousewheel
]);

@Component({
  selector: 'app-repair-process',
  templateUrl: './repair-process.component.html',
  styleUrls: ['./repair-process.component.css'],
  animations: [
    // Each unique animation requires its own trigger. The first argument of the trigger function is the name
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('rotated => default', animate('500ms ease-out')),
      transition('default => rotated', animate('500ms ease-in'))
    ])
  ]

})

export class RepairProcessComponent implements OnInit {
  [x: string]: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objCaseDetail']) {
      this.ButtonCheck();

    }

  }


  @ViewChild(RepairViewComponent) repairView: RepairViewComponent;
  @ViewChild(NotesComponent) notesComponent: NotesComponent;
  @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
  @ViewChild(ReadyToPickupComponent) readytopickupcomponent: ReadyToPickupComponent;
  @ViewChild(HandOverComponent) handover: HandOverComponent;
  @ViewChild(InvoiceComponent) Invoice: InvoiceComponent;
  @ViewChild(DiagnosisComponent) Diagnosis: DiagnosisComponent;
  @ViewChild(QuoteViewComponent) quoteView: QuoteViewComponent;
  @ViewChild(FeedbackComponent) feedbackView: FeedbackComponent;
  @ViewChild("swiperRef", { static: false }) sliderRef?: SwiperComponent;

  names = [
    '<i class="fa-duotone fa-screwdriver-wrench"></i> tab 1',
    '<i class="fa-duotone fa-clipboard"></i> tab 2',
    '<i class="fa-solid fa-file-chart-column"></i> tab 3',
    '<i class="fa-solid fa-file-contract"></i> tab 4',
    '<i class="fa-solid fa-file-invoice"></i> tab 5',
    '<i class="fa-duotone fa-chart-area"></i> tab 6',
    '<i class="fa-duotone fa-chart-mixed"></i> tab 7',
    '<i class="fa-duotone fa-chart-mixed"></i> tab 8',
    '<i class="fa-duotone fa-chart-mixed"></i> tab 9',

  ];

  config: SwiperOptions = {
    modules: [Navigation, Pagination, Scrollbar],
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 20,
    freeMode: true,
    mousewheel: { forceToAxis: true, },
    loop: false,
    allowTouchMove: false,
    pagination: { clickable: true },
    grabCursor: false,
    keyboard: {
      enabled: true,
    },
  };



  indexNumber = 1;

  scrollBarOption = {
    el: '.swiper-scrollbar', draggable: true, enabled: true,
  }

  constructor(
    // public activeModal: NgbActiveModal,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    public dialogRef: MatDialog,
    private reportService: ReportService,
    private spinner: NgxSpinnerService

  ) {
    //let swiper = new Swiper('.swiper-container',this. config);

  }
  typeSelected = 'ball-clip-rotate';

  BinddedForm: FormGroup;
  openHeader: boolean = false;
  isToShowPartRequestForm: boolean = false;
  inStatus = ""
  panelOpenState = false;
  state: string = 'default';
  ServiceType: DropDownValue = this.getBlankObject();
  JobWarrantyStatus: DropDownValue = this.getBlankObject();
  PaidAmount: number
  PaymentDetails: any[] = []
  itemCode: DropDownValue = this.getBlankObject();
  Material: DropDownValue = this.getBlankObject();
  quoteForm: FormGroup;
  partrequestForm: FormGroup;
  DiagHeaderForm: FormGroup;
  Noteslist = "";
  isAllEventPop: boolean = false
  @Output() gidnumber = new EventEmitter<any>()
  repairOptionValue = ""
  repairOptionData = ""
  receivedGidNumber: string = '';
  convertStockData
  doaData
  stockDOAData
  goodPartReturn
  Defect: any[] = [];
  RepairPart: any[] = [];
  quotePartList: any[];
  repairPartList: any[];
  repairPartListVerification: any[];
  selectedFiles: any;
  caseGUID: string;
  warrantystatus: any;
  errorMessage: String;
  laborCover;
  partCover: string;
  htmlString: any

  IsSecondRepair: boolean = false;
  SelectedCompanyStockList: any = [];
  SelectedReplenishList: any = [];

   IsResetDiagnosisBillableFlag:boolean=false;



  checkLaborCover() {
    if (this.objCaseDetail?.LaborCovered == undefined || this.objCaseDetail?.LaborCovered == 0) {
      this.laborCover = 'Not Eligible'
    } else {
      this.laborCover = 'Eligible'
    }
  }

  checkPartCover() {
    if (this.objCaseDetail?.PartCovered == undefined || this.objCaseDetail?.PartCovered == 0) {
      this.partCover = 'Not Eligible'
    } else {
      this.partCover = 'Eligible'
    }
  }

  //pop flags
  isOpenPanelDetails: boolean = false
  isDetails: boolean = true
  isDiagnosisPop: boolean = false;
  isQoutePop: boolean = false;
  isPartRequestPop: boolean = false;
  isRepairPop: boolean = false;
  isNotesPop: boolean = false;
  isInvoisePop: boolean = false;
  isReadyToPickup: boolean = false;
  isGIDMAP: boolean = false;
  isPaymentPickup: boolean = false;
  isComponentIssuesPop: boolean = false;
  isDiscountPopup: boolean = false
  isAssignTechPop: boolean = false;
  isRepairViewComponentIssues: boolean = false;
  isDivShow: boolean = false;
  isToShowFeedBack = false;
  isHandOver: boolean = true;
  isNotesListOpen: boolean = false;
  customerdetails: boolean;
  casedetails: boolean = true;

  isQuotationResetsPop

  IsResetQuotePopup: boolean = false;

  isCompanyStockPopup: boolean = false;
  isReplenishPopup: boolean = false;
  IsTableReplacementResetPopup: boolean = false;


  SymptomsField: any[] = [];


  selectSymptom: '';
  selectDefect: '';
  selectRepair: '';
  showLoaner: boolean = false

  isPartConsumes: '';
  selectMaterial: '';
  quantityCount: '';
  resultObj = {};
  isDiagSliderButtonStatus = ''
  isQuoteSliderButtonStatus = ''
  isRepairSliderButtonStatus = ''
  isNotesSliderButtonStatus = ''
  isPaymentSliderButtonStatus = ''
  isRFPSliderButtonStatus = ''
  isCallCloseSliderButtonStatus = ''



  finalResult: any = [];
  objCaseDetailObServable: Observable<CaseDetail>;
  objCaseDetail: CaseDetail;
  objcomponentissuelist: any[];
  repairViewList: any[];
  selectedNotesTemplate: any[] = []
  loadDiag: boolean;
  device: any;
  InputMode = ''

  status = [
    { id: 1, name: 'Open' },
    { id: 2, name: 'Release' },
  ]

  selectedStatus: any;
  selectedServiceType: '';
  selectedDiagnosisCode: '';

  // SelectedWarrantyStatuss: '';
  selectedTechnicianCode: '';
  selectReasonForChange: '';
  isInWarranty = false;
  selectDiagDate: Date = new Date();
  isToShowDiagnosisItemForm: boolean = false;

  // Quote form data
  selectItemType: '';
  selectItemCode: any;
  selectQuantity: '';
  selectunitPrice: '';
  selectDicountPercent: '';
  selectBaseAmount: '';
  selectTaxPercent: '';
  selectTaxAmount: '';
  selectNetPrice: '';
  selectHSNCode: '';
  selectTotalPrice: '';

  innerTabs = 1;
  innerTab = 1;
  atech: boolean
  stepIndex: number = 1;

  selectedMaterialPartRequest: any;
  handoverstatus = ""
  show = false;
    IsDataBackupResetPopup: boolean = false;

  

  ngOnInit(): void {


    this.caseGUID = this.activatedRoute.snapshot.queryParams.guid;
    if (this.caseGUID == null || this.caseGUID.trim() == "") {
    }
    this.getRepair();
    this.innerTabs = 1;
    this.innerTab = 1;
    this.selectedStatus = this.status[0]['id']


    this.checkPartCover()
    this.checkLaborCover()
  }


  CloseGIDMAP($event) {
    this.isGIDMAP = $event;
  }


  //--All Show & Hide Flag--// 
  isRFPButton: boolean = true;
  isHandoverButton: boolean = true;
  isDiagShow: boolean = false;
  isNoteShow: boolean = false;
  isQuestionShow: boolean = false;
  isQuoteShow: boolean = false;
  isPaymentShow: boolean = false;
  isInvoiceShow: boolean = false;
  isRepairShow: boolean = false;
  isRFPShow: boolean = false;
  isHandOverShow: boolean = false;
  isImageUpload: boolean = false;
  isSignature: boolean = false;
  isRejectReason: boolean = false;
  isOtpVerification: boolean = false;
  isCommunicationPopup: boolean = false;
  isCommunicationDetailPopup: boolean = false;
  isRepairPopup: boolean = false;
  isCallPopup: boolean = false;

  isJobOnHold: boolean = false;

  // -------------------------- //

  DiagIndexNo: number;
  NotesIndexNo: number;
  QuestionIndexNo: number;
  QuoteIndexNo: number;
  PaymentIndexNo: number;
  InvoiceIndexNo: number;
  RepairIndexNo: number;
  RFPIndexNo: number;
  HandOverIndexNo: number



  SildesTo(index: number) {
    this.sliderRef.swiperRef.slideTo(index - 1, 0);
  }

  FlagCheck() {
    this.ChangeFlageStatus();
    this.sliderButtonStatus()
    if (this.objCaseDetail.AssignTechFlag == 0 && (this.objCaseDetail?.CASADETAILS == undefined || this.objCaseDetail?.CASADETAILS == null)) {
      this.toastr.info("Job not posted to Casa!")
      // this.saveCasaJobLead(this.objCaseDetail.CaseGUID)
    }

    if (this.objCaseDetail.AssignTechFlag == 0) {
      this.toastr.warning("Assign Technician First")
      this.CustomerDetails();
    }

    if (this.objCaseDetail.AssignTechFlag == 1 && this.objCaseDetail?.DIAG?.BillableRepair == 1) {
      this.isDiagShow = true;
      this.isNoteShow = true;
      this.isRepairShow = true;
      this.isQuestionShow = true;
      this.isRFPShow = true;
      this.isHandOverShow = true;
      this.isQuoteShow = true;
      this.isPaymentShow = true;
      this.isInvoiceShow = true;
      this.DiagIndexNo = 1;
      this.QuoteIndexNo = 2;
      this.NotesIndexNo = 3
      this.QuestionIndexNo = -1
      this.RepairIndexNo = 4
      this.PaymentIndexNo = 5
      this.InvoiceIndexNo = 6
      this.RFPIndexNo = 7
      this.HandOverIndexNo = 8
    }
    else if (this.objCaseDetail.AssignTechFlag == 1 && this.objCaseDetail?.DIAG?.BillableRepair == 0) {
      this.isDiagShow = true;
      this.isNoteShow = true;
      this.isRepairShow = true;
      this.isQuestionShow = true;
      this.isRFPShow = true;
      this.isHandOverShow = true;
      this.isQuoteShow = false;
      this.isPaymentShow = false;
      this.isInvoiceShow = false;

      this.DiagIndexNo = 1;
      this.NotesIndexNo = 2
      this.RepairIndexNo = 3
      this.RFPIndexNo = 4
      this.HandOverIndexNo = 5

    }
    else if (this.objCaseDetail.AssignTechFlag == 1) {
      this.isDiagShow = true;
      this.isNoteShow = true;
      this.isRepairShow = false;
      this.isQuestionShow = false;
      this.isRFPShow = false;
      this.isHandOverShow = false;
      this.isQuoteShow = false;
      this.isPaymentShow = false;
      this.isInvoiceShow = false;


      this.DiagIndexNo = 1;
      this.NotesIndexNo = 2

    }
    else {
      this.isDiagShow = false;
      this.isNoteShow = false;
      this.isRepairShow = false;
      this.isQuestionShow = false;
      this.isRFPShow = false;
      this.isHandOverShow = false;
      this.isQuoteShow = false;
      this.isPaymentShow = false;
      this.isInvoiceShow = false;

    }
    if (this.objCaseDetail.RepairFlag == 1) {
    }
    if (this.objCaseDetail?.CASADETAILS != undefined && this.objCaseDetail?.CASADETAILS != null) {
      let casaList = Array.isArray(this.objCaseDetail?.CASADETAILS?.Details) ? this.objCaseDetail?.CASADETAILS.Details : [this.objCaseDetail?.CASADETAILS.Details]
      let handoverForCasa = casaList.findIndex(item => item.TransactionGUID == this.objCaseDetail.HandoverGUID)
      if (this.objCaseDetail.HandoverFlag == 1 && handoverForCasa == -1) {
        this.toastr.info("Job Handover not posted to Casa!")
        this.saveCasaJobLead(this.objCaseDetail.CaseGUID)
      }
    }
  }

  saveCasaJobLead(data) {
    try {
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
            if (response.code == '0') {
              this.toastr.info("Info ", "Posted to Casa successfully!");
            }
            else {
              let errorMessage: string = response.message;
              // errorMessage = errorMessage.replace("'", "").replace('"', "")
              errorMessage = errorMessage.replace(/['"]/g, "")
              this.toastr.error("Error While Posting to Casa", errorMessage);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            this.toastr.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
            console.log(err);
          }
        });
    }
    catch (err) {
      this.toastr.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
    }
  }

  repairButton: boolean = true;
  quoteButton: boolean = true;

  ButtonCheck() {
    if (this.objCaseDetail?.repairPartList?.length <= 0 || this.objCaseDetail.RepairFlag == 1) {
      this.repairButton = false;
    }

  }


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  getRepair() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobObject"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.caseGUID,
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
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            this.objCaseDetailObServable = response['ExtraDataJSON'];
            this.objCaseDetail = response['ExtraDataJSON'];
            if (this.objCaseDetail.ProductType == "SERIALIZED") {
              this.isAllEventPop = true;
            }
            this.objCaseDetail = Object.assign({}, this.objCaseDetail);
            this.loadDiag = true;
            console.log("ObjCaseDetail ", this.objCaseDetail)
            this.FlagCheck()

          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

  oncloseClick(headerDetails: HTMLElement, e: Event) {
    var HeaderPandel = document.getElementsByClassName("header_details_content")[0];
    if (this.openHeader == true) {
      this.openHeader = false;
      headerDetails.classList.remove("animate-opacity");
      headerDetails.classList.remove("rotate");
      headerDetails.classList.add("rotate-reverse");
      HeaderPandel.classList.add("animate-opacity");
    } else {
      this.openHeader = true;
      headerDetails.classList.add("animate-opacity");
      headerDetails.classList.add("rotate");
      headerDetails.classList.remove("rotate-reverse");
      HeaderPandel.classList.remove("animate-opacity");
    }
  }

  getErrorMessage(control: string): string {
    let formControl = this.quoteForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    for (let error of response.errorMessageJson.ERRORLIST.ERRORMESSAGE) {
      let controlName = "";
      switch (error.FIELDNAME[0]) {
        case "Qty":
          controlName = "quantity";
          break;
        case "Unit Price":
          controlName = "unitPrice";
          break;
        case "Discount(%)":
          controlName = "dicountPercent";
          break;
        case "Base Amount":
          controlName = "baseAmount";
          break;
        case "Tax(%)":
          controlName = "taxPercent";
          break;
        case "Tax Amount":
          controlName = "taxAmount";
          break;
        case "Net Price":
          controlName = "netPrice";
          break;
        case "HSN Code":
          controlName = "hsnCode";
          break;
        case "Total Price":
          controlName = "totalPrice";
          break;
      }
      this.quoteForm.controls[controlName].setErrors({ "Invalid": true, "Message": error.ERRORMESSAGE[0] });
    }
  }


  toggleGIDPopUp() {
    this.isGIDMAP = true
  }


  quoteFormClose(selectedpart) {
    this.quotePartList = selectedpart;
    this.isQoutePop = false;
  }

  onComponentIssueAdd(compoissuelist: any[]) {
    this.objcomponentissuelist = compoissuelist;
  }

  repairViewComponentIssues(repaircompoissuelist: any[]) {
    this.repairViewList = repaircompoissuelist;
    this.isRepairViewComponentIssues = true;
  }

  repairFormClose(Selectedrepairparts) {
    this.repairPartList = Selectedrepairparts;
    this.isRepairPop = false;
  }

  addsNotes() {
    this.notesComponent.addNotesList()
  }

  openNotesTemplate($event) {
    this.isNotesListOpen = $event
  }

  NotesListClose($event) {
    this.isNotesListOpen = $event

  }

  editDaig() {

    if(this.objCaseDetail.HandoverFlag == 1 || this.objCaseDetail.HandoverFlag == '1'  )
    {
       this.toastr.error('Cannot Proceed as HandOver Already Done !')
       return
    }

    this.Diagnosis.editDiagForm()
  }

  generateInvoice() {
    '';
    this.Invoice.showButton = true;
    // this.router.navigate(['/auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { doctype: "RSALES", locationcode: this.objCaseDetail.LocationCode, customercode:this.objCaseDetail.RetailCustomerCode, caseguid:this.objCaseDetail.CaseGUID} })
  }

  addReadyToPick() {
    this.readytopickupcomponent.addReadyToPickUp()
    this.isRFPButton = false;
  }

  addHandOverDevice() {
      
    if (this.activatedRoute.snapshot.queryParams.tc == null || this.activatedRoute.snapshot.queryParams.tc == undefined) {
      this.toastr.error('Cannot Proceed For HandOver without Token code  ')
      return;
    }
    if (this.activatedRoute.snapshot.queryParams.vp != 'CPR') {
       this.toastr.error('Please Select Visit Purpose as COLLECTION  For Handover while  Token Selection ')
      return;
    }
    //this.isOtpVerification = false
    this.handover.addHandOver()
    this.isHandoverButton = false;

  }

  validatedOTP($event) {
    this.isOtpVerification = $event
    this.validHandOver()
  }

  addPayment() {
    this.paymentComponent.addPaymentList()
  }


  RepairRejectReason($event) {
    this.isRejectReason = $event
  }

  isHoldReason: boolean = false;
  RepairHoldReason($event) {
    this.isHoldReason = $event
  }

  createPaymentLink() {
    this.paymentComponent.createPaymentLink()
  }

  addComponentIssueinDiag($event) {
    this.objcomponentissuelist = $event;
    this.isComponentIssuesPop = false;
  }

  // Discount Popup 
  discountObj: any
  applyDiscountObj: any
  DiscountCouponPopup($event) {
    this.discountObj = $event
    this.isDiscountPopup = $event?.showPopUp
  }
  applyDiscount($event) {
    this.applyDiscountObj = $event
  }

  assignTechFlagSet($event) {

    this.objCaseDetail.AssignTechFlag = 1;
    this.objCaseDetail.AssignTechGUID = $event.AssignTechGUID;
    this.objCaseDetail.ASGTECH = $event;
    this.isAssignTechPop = false;

    this.FlagCheck()
  }

  Un_HoldUpdated($event) {
    this.objCaseDetail.JobStatus = $event.JobStatus;
    this.objCaseDetail.JobStatusDesc = $event.JobStatusDesc
    this.isJobOnHold = false
    this.isRFPButton = true
    this.isHandoverButton = true
    this.FlagCheck()
  }

  PartConstraintStatusChange($event) {
    
    this.objCaseDetail.JobStatus = $event.JobStatusDesc;
  }

  openComponentIssuePopup($event) {
    this.isComponentIssuesPop = true;
  }

  DiagUpdated($event) {

    var objDiag = $event;
    let DiagsnosisGUID = objDiag.DiagsnosisGUID;
    this.objCaseDetail.DiagFlag = 1
    this.objCaseDetail.DiagGUID = DiagsnosisGUID
    this.objCaseDetail.DIAG = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
    this.FlagCheck()

  }

  RepairUpdated($event) {

    var objRepair = $event;
    let RepairGUID = objRepair.RepairGUID
    this.objCaseDetail.RepairFlag = 1
    this.objCaseDetail.RepairGUID = RepairGUID
    this.objCaseDetail.REPAIR = null
    this.objCaseDetail.REPAIR = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
    this.editDaig()

  }

  UpdateQuote($event) {
    var objQuote = $event;
    let QuoteGUID = objQuote.QuoteGuid
    this.objCaseDetail.QuoteFlag = 1
    this.objCaseDetail.QuoteGUID = QuoteGUID
    this.objCaseDetail.QUOTE = null
    this.objCaseDetail.QUOTE = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);

  }



  NotesUpdated($event) {
    this.objCaseDetail.NOTESLIST = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }

  HoldUpdated($event) {
    var holdList = $event.HOLDLIST
    this.objCaseDetail.HOLDLIST = { ...holdList };
    this.objCaseDetail.JobStatus = $event.JobStatus;
    this.objCaseDetail.JobStatusDesc = $event.JobStatusDesc
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
    this.FlagCheck()
  }

  UnclaimedUpdated($event) {
    var unclaimed = $event.UNCLAIMED
    this.objCaseDetail.UNCLAIMED = { ...unclaimed };
    this.objCaseDetail.JobStatus = $event.JobStatus;
    this.objCaseDetail.JobStatusDesc = $event.JobStatusDesc
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
    this.FlagCheck()
  }


  HanOverUpdated($event) {
    this.objCaseDetail.HANDOVER = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }

  PaymentUpdated($event) {
    this.objCaseDetail.PAYMENTLIST = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }

  RPFUpdated($event) {
    this.objCaseDetail.RFP = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }


  newtry: boolean = false
  exfun(newobj) {
    this.objCaseDetail = newobj
  }

  downloadServiceReport(reportType: String) {
    let companyCode = glob.getCompanyCode().toString()
    if (companyCode == 'NITC') {
      if (reportType == 'DELIVERY' && this.objCaseDetail.DIAG.BillableRepair == 1 && this.objCaseDetail.InvoiceFlag == '0') {
        this.toastr.error("Kindly generate Invoice first!")
        return
      }
    }

    this.spinner.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetJobObject4Print",
    });
    PdfData.push({
      "Key": "CaseGuid",
      "Value": this.objCaseDetail.CaseGUID,
    });


    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    let storepdf = contentRequest;
    this.reportService.downloadServiceReport(reportType, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.spinner.hide()


        },
        error: err => {
          console.log(err);
          this.spinner.hide()

        }
      });
  }


  printDocument() {
    var objData = { "identifiers": [] }
    objData.identifiers.push({
      "repairId": this.objCaseDetail?.REPAIR?.GSXCode == null || this.objCaseDetail?.REPAIR?.GSXCode == undefined ? this.objCaseDetail.DIAG.GSXCode : this.objCaseDetail.REPAIR.GSXCode
    })
    var documentType = "inboxLetter"
    this.spinner.show()

    var strRequestData = JSON.stringify(objData);
    var data = {
      "Content": strRequestData
    };
    this.gsxService.downloadDocument(documentType, data).subscribe(value => {
      ;
      this.spinner.hide()
      let response = JSON.parse(value.toString());
      this.htmlString = atob(response.FileContents);
      console.log("HTML String ", this.htmlString.toString())
      try {
        let errorStr = JSON.parse(this.htmlString.toString())
        if (errorStr.errorId != undefined || response.errorId == null) {
          console.log("Response ", errorStr)
          var errorMessage = "";
          for (let iCtr = 0; iCtr < errorStr.errors.length; iCtr++) {
            errorMessage = errorStr.errors[iCtr].code + ' - ' + errorStr.errors[iCtr].message;
            this.toastr.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
      }
      catch (err) {
        var printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(this.htmlString);
        printWindow.document.close();
        printWindow.addEventListener('load', function () {
          printWindow.focus();
          printWindow.print();
          printWindow.onafterprint = function () {
            printWindow.close();
          };
        });
      }


    },
      err => {
        ;
        console.log(err);
        this.toastMessage.error("Please try again. " + err)
        this.spinner.hide()

      }
    );
  }

  toggleLoanerVisibility() {
    this.showLoaner = !this.showLoaner
  }


  InvoiceFlag($event) {
    this.objCaseDetail.InvoiceFlag = $event
  }

  InvoiceSet($event) {
    this.objCaseDetail.INVOICE = { ...$event };
  }

  addSignature() {
    if (this.isSignature == true) {
      this.isSignature = false;
    } else {
      this.isSignature = true;
    }
  }

  authorisedSignature($event) {
    this.AuthPersonSignature = $event
  }


  NotesOpen() {
    if (this.isNotesListOpen == true) {
      this.isNotesListOpen = false;
    } else {
      this.isNotesListOpen = true;
    }
  }

  CustomerDetails() {
    if (this.isOpenPanelDetails == true) {
      this.isOpenPanelDetails = false;
      this.isDetails = true;
    } else {
      this.isOpenPanelDetails = true;
      this.isDetails = false;
    }
  }

  RepairRejectSubmit($event) {
    this.reasonForRepairReject = $event
    this.repairView.onSaveRejectionNotes($event)
    this.isRejectReason = false;
  }

  RepairHoldSubmit($event) {
    this.reasonForRepairHold = $event
    this.repairView.SubmitRepairHold($event)
    this.isHoldReason = false;
  }

  setQuoteStatus($event) {
    console.log("Data Quote", $event)
    this.objCaseDetail.QUOTE.QuoteStatus = $event
    this.sliderButtonStatus()
    this.ChangeFlageStatus()
  }

  sliderButtonStatus() {

    if (this.objCaseDetail?.DIAG?.DiagnosisStatus == 'RELEASED') {
      this.isDiagSliderButtonStatus = '#29ba30' //green
    } else if (this.objCaseDetail?.DIAG?.DiagnosisStatus == 'OPEN') {
      this.isDiagSliderButtonStatus = '#4860fa' //blue
    }

    if (this.objCaseDetail?.QUOTE?.QuoteStatus == null || this.objCaseDetail?.QUOTE?.QuoteStatus == undefined || this.objCaseDetail?.QUOTE?.QuoteStatus == 'Open' || this.objCaseDetail?.QUOTE?.QuoteStatus == 'RELEASED') {
      this.isQuoteSliderButtonStatus = '#4860fa' //blue
    } else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'APPROVED') {
      this.isQuoteSliderButtonStatus = '#29ba30' //green
    } else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'REJECTED') {
      this.isQuoteSliderButtonStatus = '#fa3434'  //red
    }

    if (this.objCaseDetail?.NOTESLIST == null || this.objCaseDetail?.NOTESLIST == undefined) {
      this.isNotesSliderButtonStatus = '#4860fa'  //blue
    } else {
      this.isNotesSliderButtonStatus = '#29ba30' //green
    }

    if (this.objCaseDetail?.REPAIR?.isGSXPosted == '1') {
      this.isRepairSliderButtonStatus = '#49ff24'  //green
    } else if (this.objCaseDetail?.REPAIR?.isGSXPosted == null || this.objCaseDetail?.REPAIR?.isGSXPosted == undefined) {
      this.isRepairSliderButtonStatus = ''
    }
  }

  signature: any
  signatureValidate($event) {
    this.signature = $event
  }


  AddSignature($event) {
    this.isSignature = $event
  }


  onResetRepair() {

    const shouldConfirm = confirm("Are you sure you want to Reset?")
    if (!shouldConfirm) {
      return
    }
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "ResetRepair"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.objCaseDetail.CaseGUID
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
            window.location.reload()
            this.toastr.success('Repair Reset Succesfully')
          }
          else {
            
            this.errorMessage = response.ReturnMessage;
            this.toastMessage.error("Error While Saving Invoice")
            let errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(errorMessage, (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
              errorMessages.forEach((errorMessage) => {
                this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
              });
            });
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  Cancel($event) {
    this.isImageUpload = $event
    this.isCommunicationPopup = $event
    this.isCommunicationDetailPopup = $event
    this.isRepairPopup = $event
    this.isCallPopup = $event
    this.isDiscountPopup = $event
  }

  getGID($event) {
    this.receivedGidNumber = $event;
    this.repairView.mapGID(this.receivedGidNumber);
    //this.gidnumber.emit(this.receivedGidNumber)
  }

  isstatusShow;

  ChangeFlageStatus() {
    if (this.objCaseDetail?.AssignTechFlag == null || this.objCaseDetail?.AssignTechFlag == undefined || this.objCaseDetail?.AssignTechFlag == 0) {
      this.isstatusShow = "Assign Technician First";
    }
    else if (this.objCaseDetail?.DiagFlag == null || this.objCaseDetail?.DiagFlag == undefined || this.objCaseDetail?.DiagFlag == 0 || this.objCaseDetail?.DIAG?.DiagnosisStatus == 'OPEN') {
      this.isstatusShow = "Completed Diagnosis";
    } else if (this.objCaseDetail?.DIAG?.DiagnosisStatus != 'RELEASED' && this.objCaseDetail?.DIAG?.BillableRepair != 1 && this.objCaseDetail?.QUOTE?.quoteFlag != null && this.objCaseDetail?.QUOTE?.quoteFlag != undefined) {
      this.isstatusShow = "Create Quote";
    }
    else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'OPEN') {
      this.isstatusShow = "Release Quote";
    } else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'RELEASED') {
      this.isstatusShow = "Check For Payment";
    } else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'APPROVED') {
      this.isstatusShow = "Create Payment";
    } else if (this.objCaseDetail?.QUOTE?.QuoteStatus == 'REJECTED') {
      this.isstatusShow = "Create Invoice";
    }
    else if (this.objCaseDetail?.DIAG?.BillableRepair == 0) {
      this.isstatusShow = "Complete Repair";
    }
    if (this.objCaseDetail?.JobStatus == 'S14') {
      this.isJobOnHold = true
      this.isRFPButton = false
      this.isHandoverButton = false
    }
    if (this.objCaseDetail?.JobStatus == 'S15') {
      this.isJobOnHold = true
      // this.isRFPButton = false
      // this.isHandoverButton = false
    }




  }

  RepairOption($event) {
    this.repairOptionData = $event
  }

  RepairOptionValue($event) {
    this.repairOptionValue = $event
  }

  ConvertStockData($event) {
    this.convertStockData = $event
  }

  DOAData($event) {
    this.doaData = $event
  }

  GoodPartReturn($event) {
    this.goodPartReturn = $event
  }

  StockDOA($event) {
    this.stockDOAData = $event
  }

  getRepairQuestions() {
    ;
    var Partlist = [];
    var repairType = this.Diagnosis.objDiagnosis.RepairType
    var CoverageOption = this.Diagnosis.objDiagnosis.BillingOption
    var objData

    for (let item of this.repairView.selectedpartlist) {
      if (!(item.Type == 'CNTC' || item.Type == 'SHIP')) {
        if (repairType == "WUMS") {
          Partlist.push({
            "number": item.PartCode,
            "componentIssue": {
              "componentCode": item.ComponentCode,
              "issueCode": item.IssueCode,
              "reproducibility": item.ReproducibilityCode
            }//,
            //"coverageOption": item.CoverageOption
          });

        }
        else {
          Partlist.push({
            "number": item.PartCode,
            "componentIssue": {
              "componentCode": item.ComponentCode,
              "issueCode": item.IssueCode

            },
            "coverageOption": item.CoverageOption
          });

        }

      }
      else {
        Partlist.push({
          "number": item.PartCode
        });


      }
    };
    var ComponentIssueList = [];
    var iCtr = 1
    for (let item of this.Diagnosis.objDiagnosis.SelectedComponentIssue) {
      if (repairType == "WUMS") {

        ComponentIssueList.push({
          "componentCode": item.ComponentCode,
          "issueCode": item.IssueCode,
          "reproducibility": item.ReproducibilityCode,
          "type": "TECH",
          "order": iCtr,
          "priority": iCtr
        });
      }
      else {
        ComponentIssueList.push({
          "componentCode": item.ComponentCode,
          "issueCode": item.IssueCode,
          "type": "TECH",
          "order": iCtr,
          "priority": iCtr
        });

      }
      iCtr = iCtr + 1
    };

    if (repairType == "WUMS") {


      objData = {
        "repairType": repairType,
        "componentIssues": ComponentIssueList,
        "parts": Partlist,
        "coverageOption": CoverageOption,
        "device": {
          "id": this.objCaseDetail.SerialNo1
        }
      }
    }
    else {
      objData = {
        "repairType": repairType,
        "componentIssues": ComponentIssueList,
        "parts": Partlist,
        "device": {
          "id": this.objCaseDetail.SerialNo1
        }
      }

    }

    this.feedbackView.getQuestions(objData)

  }

  UpdateRepairQuestions($event) {
    
    this.repairView.UpdateRepairQuestions($event)
  }

  repairPartsVerification($event) {
    this.repairPartListVerification = $event;
  }
  verifiedPartList
  verifiedPartsList($event) {
    this.verifiedPartList = $event
    this.repairView.verifiedPartListCheck($event)

  }

  selectedNotesList($event) {
    this.selectedNotesTemplate = $event
  }

  CreateRepairValidation() {

    this.isRepairPop = true
    /*if (this.isRepairPop == true) {
      this.isRepairPop = false;
    } else {
      this.isRepairPop = true;
    }*/
  }

  CalculatePaidAmount() {
    if (Array.isArray(this.objCaseDetail.PAYMENTLIST.Payment)) {
      this.PaymentDetails = this.objCaseDetail.PAYMENTLIST.Payment
    } else {
      this.PaymentDetails.push(this.objCaseDetail.PAYMENTLIST.Payment)
    }
    this.PaidAmount = 0
    for (let item of this.PaymentDetails) {
      if (item.TranType.toUpperCase() == "PAYMENT") {
        this.PaidAmount = parseFloat(this.PaidAmount.toString()) + parseFloat(item.Amount.toString())
      }
      else {
        this.PaidAmount = parseFloat(this.PaidAmount.toString()) - parseFloat(item.Amount.toString())
      }
    }
  }


  ValidRepair() {
    debugger
    this.isRepairPop = false
    if (this.objCaseDetail?.DIAG) {
      if (this.objCaseDetail?.DIAG?.RepairType != 'SVNR' && this.objCaseDetail.DIAG.BillableRepair == 1) {

        if (this.objCaseDetail?.QUOTE && this.objCaseDetail?.QUOTE?.QuoteStatus == 'APPROVED') {
          this.isRepairPop = true
          return true;
        }
        else {
          this.toastr.error("Quotation not approved yet!")
          return false;
        }
      }
      if (this.objCaseDetail.DIAG.BillableRepair == 0) {
        this.isRepairPop = true
        return true;
      }
    }
    this.toastr.error("Invalid Repair Type or not a billable repair!")
    return false;
  }

  // ValidRepair() {
  //   this.isRepairPop = true
  //   return true;

  //   var isValid = false;
  //   if (this.objCaseDetail.DIAG.PaymentTerms == 'COMP100') {
  //     this.CreateRepairValidation()
  //     return true
  //   }


  //   if (this.objCaseDetail?.DIAG?.BillableRepair == 1) {
  //     if (this.objCaseDetail.QuoteFlag == 1) {
  //       if (this.objCaseDetail.DIAG.PaymentTerms == 'ADV50') {
  //         var ADV50val = parseFloat((this.objCaseDetail.QUOTE.TotalNetAmount * (50 / 100)).toFixed(2));
  //         if (ADV50val <= this.PaidAmount) {
  //           this.CreateRepairValidation()
  //           return true
  //         } else {
  //           this.toastr.info("50% Payment Has To Be Done")
  //           return false
  //         }
  //       }

  //       if (this.objCaseDetail.DIAG.PaymentTerms == 'ADV100') {
  //         var ADV100val = parseFloat((this.objCaseDetail.QUOTE.TotalNetAmount * (95 / 100)).toFixed(2));
  //         if (ADV100val <= this.PaidAmount) {
  //           this.CreateRepairValidation()
  //           return true
  //         } else {
  //           this.toastr.info("100% Payment Has To Be Done")
  //           return false
  //         }
  //       }
  //     } else {
  //       this.toastr.info("Billable Is True Please Create Quote")
  //     }
  //   }
  // }


  validRFP() {
    this.addReadyToPick()
    return true
  }

  validHandOver() {
    this.addHandOverDevice()
    return true;
  }

  otpVerification() {
    var data = 'ajay'
    return data
  }

  onCommDetailsUpdated($event) {
    this.objCaseDetail.COMMDETAILS = { ...$event };
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }


  // second repair 
  ShowSecondRepairPopUp() {
    this.IsSecondRepair = true;
  }

  HideSecondRepairPopUp($event) {
    this.IsSecondRepair = $event
  }

  SaveSecondRepairPopUp($event) {
    console.log('from SaveSecondRepairPopUp', $event)
    window.location.reload()
  }


  QuotationResetsPop() {
    this.isQuotationResetsPop = true
  }

  closeQuotationResetsPop() {
    this.isQuotationResetsPop = false;
  }

  ResetQuote() {
    this.IsResetQuotePopup = true
  }

  closeResetQuotePopup() {
    this.IsResetQuotePopup = false;
  }


  //Reset Quote 

  // ResetQuote(){
  //  

  //  this.spinner.show()

  //   // const IsConfirm = confirm("Are You Sure? want to Reset The Quote")
  //   // if(!IsConfirm){
  //   //  return
  //   // }

  //   const ResetReason =  prompt("Please Enter Reason of Quotation Reset")
  //   if (ResetReason === null) {
  //     this.toastr.error("Reset Canceled");
  //     return;
  //   } 
  //   else if (ResetReason.trim() === "") {
  //     this.toastr.error("Reset Reason is required");
  //     return;
  //   } 
  //   else {
  //     console.log("Reason:", ResetReason);
  //   }


  //  if(this.activatedRoute.snapshot.queryParams.guid == null || this.activatedRoute.snapshot.queryParams.guid ==undefined || this.activatedRoute.snapshot.queryParams.guid ==''){
  //    this.toastMessage.error('Guid Cannot be empty!');
  //    return
  //  }

  //  let requestData = [];
  //  requestData.push({
  //    Key: "ApiType",
  //    Value: "ResetQuotation",
  //  });
  //  requestData.push({
  //    Key: "CompanyCode",
  //    Value: glob.getCompanyCode(),
  //  });
  //  requestData.push({
  //    Key: "CaseGuid",
  //    Value: this.activatedRoute.snapshot.queryParams.guid
  //  });
  //  requestData.push({
  //    Key: "ResetReason",
  //    Value: ResetReason == null || ResetReason == undefined ? '' : ResetReason
  //  });


  //  let strRequestData = JSON.stringify(requestData);
  //  let contentRequest = {
  //    "content": strRequestData
  //  };

  //  console.log('Resest Quote contentRequest' , contentRequest);

  // //  return 
  //  this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
  //    next: (value) => {
  //      
  //      let response = JSON.parse(value.toString());
  //      if (response.ReturnCode == "0") {

  //        this.toastMessage.success("Submitted Successfully");
  //          window.location.reload()

  //        this.spinner.hide()

  //      } else {

  //        console.log('response.ReturnMessage' , response.ReturnMessage);
  //          this.toastMessage.error("Something Went Wrong!" ,response.ReturnMessage);
  //          this.spinner.hide()
  //        // this.errorMessage = response.ReturnMessage;
  //        // const parser = new xml2js.Parser({ strict: false, trim: true });
  //        // parser.parseString(response.ErrorMessage, (err, result) => {
  //        //   response["errorMessageJson"] = result;
  //        //   this.handleError(response);
  //        // });
  //      }
  //    },
  //    error: (err) => {

  //      console.error(err);
  //      this.toastMessage.error("An error occurred while Resetting the Quote", "Error");
  //      this.spinner.hide()
  //    },
  //  });
  // }


  closeCompanyStockPopup($event) {

    this.isCompanyStockPopup = false
  }

  closeCompanyStockPopupEvent($event) {
    
    this.isCompanyStockPopup = false
    this.SelectedCompanyStockList = $event
  }
  openCompanyStockPopup() {
    this.isCompanyStockPopup = true

  }


  closeReplenishPopup($event) {

    this.isReplenishPopup = false
  }

  closeReplenishPopupEvent($event) {
    
    this.isReplenishPopup = false
    this.SelectedReplenishList = $event
  }
  openReplenishPopup() {
    this.isReplenishPopup = true
  }

  UpdateTableReplacement($event) {
    this.objCaseDetail = Object.assign({}, this.objCaseDetail);
  }

  CloseResetTableReplacementPopup($event) {
    
    this.IsTableReplacementResetPopup = false;
    this.location.reload()
  }
  
    openResetDiagnosisPopup(){
    
    this.IsResetDiagnosisBillableFlag = true;
  }

  CloseResetDiagnosisPopupComponentEvent(){
    
    this.IsResetDiagnosisBillableFlag = false;
  }

   CloseDataBackupPopupEvent($event) {
    
    console.log($event)
    this.IsDataBackupResetPopup = false;
    this.location.reload()
  }


}