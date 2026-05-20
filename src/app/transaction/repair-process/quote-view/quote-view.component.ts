import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Quote, QuoteItem } from "./quote-view.metadeta";
import { v4 as uuidv4 } from "uuid";
import { CaseDetail } from "../repair-process.metadata";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import xml2js from "xml2js";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import * as glob from "../../../config/global";
import { DropdownDataService } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { GsxService } from "src/app/common/Services/gsxService/gsx.service";
import { DropDownValue } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { ToastrService } from "ngx-toastr";
import { RouterState } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { DatePipe } from '@angular/common';
import { window } from "rxjs";

@Component({
  selector: "app-quote-view",
  templateUrl: "./quote-view.component.html",
  styleUrls: ["./quote-view.component.css"],
  animations: [
    trigger("rotatedState", [
      state("default", style({ transform: "rotate(0)" })),
      state("rotated", style({ transform: "rotate(-180deg)" })),
      transition("rotated => default", animate("500ms ease-out")),
      transition("default => rotated", animate("500ms ease-in")),
    ]),
  ],
})
export class QuoteViewComponent implements OnInit, OnChanges {
  PriceTypeList: any = ["ExchangePrice", "StockPrice"];
  issueshover = "";
  coveragehover = "";
  quotestatushover = "";
  isDeletshover: "";
  quoteStatus = "";
  quoteCode = "";
  HeaderDiscount: number;
  errorMessage: any;
  newquoteGuid = uuidv4();
  quoteForm: FormGroup;
  quoteStatusForm: FormGroup;
  objQuote: Quote;
  isShowTotal: boolean = false;
  isOpenStatus: boolean = false;
  IssuesList: any[] = [];
  ComponentList: any[] = [];
  ComponentIssueList: any[] = [];
  state: string = "default";
  QuoteStatusList: any[] = [];
  coverages: DropDownValue = DropDownValue.getBlankObject();
  quotestatus: DropDownValue = DropDownValue.getBlankObject();
  PricingOptionDD: DropDownValue = DropDownValue.getBlankObject();

  @Input() repa: CaseDetail;
  @Input() partlist: any[] = [];
  @Output() UpdateQuote = new EventEmitter<any>();
  @Output() setQuoteStatus = new EventEmitter<any>();
  @Output() discountpopUp = new EventEmitter<any>();
  @Input() discountApprovedObject: any;

  lstDiagdetail: any[] = [];

  ContractApplicable: boolean = false;
  ContractStartDate: any
  ContractEndDate: any
  ContractCode: any
  IsContractApplicable: any = "0"

  AmcTypeMasterDetailsList: any[] = [];

    RejectQuoteReasonDD: DropDownValue = DropDownValue.getBlankObject();
    RejectQuoteReason: any;
  Math = Math;
  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private datePipe: DatePipe,

  ) { }

  ngOnInit(): void {
    // INIT
    this.InitializeObject();
    this.getQuoteStatus({ term: "", items: [] });
    this.UpdateQuoteStatus();
    this.onPricingOptionSearch({ term: "", item: [] });
    this.GetAmcTypeMasterDetailsList()
    this.onQuoteRejectReasonSearch({ term: "", items: [] });

    console.log('abd values',Math.abs(-10.00))
  }

  onPricingOptionSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.PricingOption, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.PricingOptionDD = value;
        }
      },
      error: (err) => {
        this.PricingOptionDD = DropDownValue.getBlankObject();
      }
    });
  }

   onQuoteRejectReasonSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.QUOTEREJECTREASON, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.RejectQuoteReasonDD = value;
          console.log("RejectQuoteReasonDD ", this.RejectQuoteReasonDD)
        }
      },
      error: (err) => {
        this.RejectQuoteReasonDD = this.getBlankObject();
      }
    });
  }
  getBlankObject(): DropDownValue {
    throw new Error("Method not implemented.");
  }

  UpdateQuoteStatus() {
    this.QuoteStatusList = [];
    if (this.quoteStatus == null || this.quoteStatus == undefined || this.quoteStatus == "OPEN") {
      this.QuoteStatusList.push({
        QuoteStatusCode: "OPEN",
        QuoteStatusDescription: "Quote Preparation",
      });
      this.QuoteStatusList.push({
        QuoteStatusCode: "RELEASED",
        QuoteStatusDescription: "Quote Submit To Customer",
      });
      // this.QuoteStatusList.push({
      //   QuoteStatusCode: "DISCOUNTAPPROVAL",
      //   QuoteStatusDescription: "Quote Submit For Discount Approval",
      // });
    }

    if (this.quoteStatus == "RELEASED") {
      this.QuoteStatusList.push({
        QuoteStatusCode: "APPROVED",
        QuoteStatusDescription: "Quote Approved By Customer",
      });
      this.QuoteStatusList.push({
        QuoteStatusCode: "REJECTED",
        QuoteStatusDescription: "Quote Rejected By Customer",
      });
    }

    // if (this.quoteStatus == "DISCOUNTAPPROVAL") {
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "DISCOUNTAPPROVED",
    //     QuoteStatusDescription: "Discount Approved By Approver",
    //   });
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "DISCOUNTREJECTED",
    //     QuoteStatusDescription: "Discount Rejected By Approver",
    //   });
    // }
    // if (this.quoteStatus == "DISCOUNTAPPROVED") {
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "RELEASED",
    //     QuoteStatusDescription: "Quote Submit To Customer",
    //   });
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "APPROVED",
    //     QuoteStatusDescription: "Quote Approved By Customer",
    //   });
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "REJECTED",
    //     QuoteStatusDescription: "Quote Rejected By Customer",
    //   });
    // }
    // if (this.quoteStatus == "DISCOUNTREJECTED") {
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "OPEN",
    //     QuoteStatusDescription: "Quote Preparation",
    //   });
    //   this.QuoteStatusList.push({
    //     QuoteStatusCode: "RELEASED",
    //     QuoteStatusDescription: "Quote Submit To Customer",
    //   });
    // }
  }

  validateDiscountAmount(value, item) {
    
    if (value < 0) {
      this.toaster.error("Invalid Discount Amount!");
    }
    if (value > item.UnitPrice) {
      this.toaster.error("Discount Amount cannot be greater than Net Amount");
    }
  }

  // onHeaderDiscountAmount(item) {
  //   var rowno = item.rowno;
  //   item.DiscountAmount = this.quoteForm.controls["DiscountAmount" + rowno.toString()].value;
  //   if (item.DiscountAmount < 0 ) {
  //     this.toaster.error("Invalid Discount Amount!");
  //     return
  //   }
  //   if (item.DiscountAmount > item.UnitPrice) {
  //     this.toaster.error("Discount Amount cannot be greater than Net Amount");
  //     return
  //   }
  //   item.DiscountPercentage = this.round(item.DiscountAmount / item.BaseAmount / 100);
  //   item.TaxableAmount = item.BaseAmount - item.DiscountAmount;
  //   item.TaxAmount = this.round((parseFloat(item.TaxableAmount.toString()) * parseFloat(item.GSTPercentage.toString())) / 100);
  //   this.calculateDetails();
  //   // this.add_Discount_quote();
  //   // this.onSubmit();
  // }

  onSelectComponent($event) {
    this.IssuesList = $event.issues;
  }

  onSelectIssue($event: { term: string; items: any[] }) { }

  getCovarage($event: { term: string; items: any[] }) {
    this.spinner.show();
    this.dropdownDataService
      .fetchDropDownData(DropDownType.CovarageOption, $event.term, {})
      .subscribe({
        next: (value) => {
          this.spinner.hide();
          if (value != null) {
            console.log(value);
            this.coverages = value;
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.coverages = DropDownValue.getBlankObject();
        },
      });
  }

  getQuoteStatus($event: { term: string; items: any[] }) {
    this.spinner.show();
    this.dropdownDataService
      .fetchDropDownData(DropDownType.QuoteStatus, $event.term, {})
      .subscribe({
        next: (value) => {
          this.spinner.hide();
          if (value != null) {
            console.log(value);
            this.quotestatus = value;
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.quotestatus = DropDownValue.getBlankObject();
        },
      });
  }

  coveragehoverFunc(item) {
    
    if (this.quoteStatus != 'OPEN') {
      this.toaster.error('Allowed only when the Quote Status is OPEN ')
      return
    }
    console.log("**", item);
    if (item.isCoverage == true) {
      item.isCoverage = false;
    } else {
      item.isCoverage = true;
    }
  }

  onQuoteStatus() {
    if (this.isOpenStatus == true) {
      this.isOpenStatus = false;
    } else {
      this.isOpenStatus = true;
    }
  }

  isCheckBoxFunc(item) {
    if (item.isCheckBox == true) {
      item.isCheckBox = false;
    } else {
      item.isCheckBox = true;
    }
  }


  addApprovedDiscountToLineItem(obj) {
    
    console.log("Quote Obj ", obj)
    if (this.objQuote?.QuoteDetail == null || this.objQuote?.QuoteDetail == undefined) {
      this.toaster.error("No Parts found in Quote")
      return
    }
    else {
      this.objQuote?.QuoteDetail.forEach(item => {
        if (item.ItemCode == obj?.MaterialCode) {
          
          let discountAmount = Number(obj?.DiscountAmount ?? 0);
          if (isNaN(discountAmount))
            discountAmount = 0;
          if(obj?.DiscountType == 'ADD'){
          item.DiscountAmount = - discountAmount;
          }
          else{
          item.DiscountAmount = discountAmount;
          }
          item.DiscountCouponCode = obj?.CouponCode
          this.calculateDetails(item);
        }
      })
      console.log(this.objQuote.QuoteDetail)
    }
  }

  isPriceTypeFuc(item) {
    if(this.quoteStatus != 'OPEN'){
      this.toaster.error('Allowed only when the Quote Status is OPEN')
      return
    }   

    if (item.isPriceType == true) {
      item.isPriceType = false;
    } else {
      item.isPriceType = true;
    }
  }

  issueshoverFunc(item) {
    if (this.quoteStatus != 'OPEN') {
      this.toaster.error('Allowed only when the Quote Status is OPEN')
      return
    }

    if (item.isCompIssue == true) {
      item.isCompIssue = false;
    } else {
      item.isCompIssue = true;
    }
  }

  InitializeObject() {
    this.quoteForm = this.formBuilder.group({
      QuoteCode: [null],
    });

    this.quoteStatusForm = this.formBuilder.group({
      QuoteStatus: [null],
    });

    this.get_Component_Issue();
    this.getCovarage({ items: [], term: "" });
    this.onSelectComponent({ term: "", items: [] });
    this.onSelectIssue({ term: "", items: [] });
    this.CreateFormControlName();
  }
  CreateFormControlName() {
    if (this.objQuote?.QuoteDetail == undefined) {
      return;
    } else {
      for (var item of this.objQuote?.QuoteDetail) {
        if (
          this.quoteForm.contains("component" + item.rowno.toString()) == false
        ) {
          var formcontrolname = "component" + item.rowno.toString();
          this.quoteForm.addControl(
            formcontrolname,
            new FormControl("", Validators.required)
          );
          formcontrolname = "issues" + item.rowno.toString();
          this.quoteForm.addControl(
            formcontrolname,
            new FormControl("", Validators.required)
          );
          formcontrolname = "PriceType" + item.rowno.toString();
          this.quoteForm.addControl(
            formcontrolname,
            new FormControl("", Validators.required)
          );
          formcontrolname = "coverageOption" + item.rowno.toString();
          this.quoteForm.addControl(
            formcontrolname,
            new FormControl("", Validators.required)
          );
          formcontrolname = "DiscountAmount" + item.rowno.toString();
          this.quoteForm.addControl(formcontrolname, new FormControl(""));
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes["repa"]) {


      //  adding just to test 

      // this.ContractCode = 'CBE52511100001MAC1YR'
      // const tempContractStartDate = '2025-11-10 00:00:00.000'
      // const temoContractEndDate = '2026-11-10 00:00:00.000'

      // const temppresentDate = new Date()
      // const presentDate = this.datePipe.transform(temppresentDate, 'yyyy-MM-dd')
      // this.ContractStartDate = this.datePipe.transform(tempContractStartDate, 'yyyy-MM-dd'),

      // this.ContractEndDate = this.datePipe.transform(temoContractEndDate, 'yyyy-MM-dd'),

      // this.ContractApplicable = this.ContractStartDate <= presentDate && this.ContractEndDate >= presentDate


      const temppresentDate = new Date()
      const presentDate = this.datePipe.transform(temppresentDate, 'yyyy-MM-dd')

      this.ContractStartDate = this.datePipe.transform(this.repa?.ContractStartDate, 'yyyy-MM-dd'),
        this.ContractEndDate = this.datePipe.transform(this.repa?.ContractEndDate, 'yyyy-MM-dd'),
        this.ContractApplicable = this.ContractStartDate <= presentDate && this.ContractEndDate >= presentDate
      this.ContractCode = this.repa?.ContractCode
      this.IsContractApplicable = this.repa?.IsContractApplicable || "0"


      console.log('this.repa from quote view', this.repa)

      this.quoteCode = this.repa?.QUOTE?.QuoteCode;
      this.quoteStatus = this.repa?.QUOTE?.QuoteStatus;
      this.RejectQuoteReason = this.repa?.QUOTE?.RejectReason 
      if (this.repa != null && this.repa != undefined) {
        this.newquoteGuid = this.repa?.QUOTE?.QuoteGuid;
        this.objQuote = {
          QuoteGuid: this.newquoteGuid,
          CaseGuid: this.repa.QUOTE.QuoteGUID,
          QuoteCode: this.repa.QUOTE.QuoteCode,
          NetAmount: this.repa.QUOTE.TotalNetAmount,
          BaseAmount: this.repa.QUOTE.TotalBaseAmount,
          Currency: "INR",
          QuoteStatus: this.repa.QUOTE.QuoteStatus,
          Discount: this.repa.QUOTE.TotalDiscountAmount,
          TaxAmount: this.repa.QUOTE.TotalTaxAmount,
          TaxableAmount: this.repa.QUOTE.TotalTaxableAmount,
          QuoteDate: this.repa.QUOTE.QuoteDate,
          QuoteDetail: [],
          Remark: this.repa.QUOTE.Remark,
        };

        var lstQuoteList = [];
        console.log('this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem', this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem)
        if (Array.isArray(this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem)) {
          lstQuoteList = this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem;
        } else {
          var quoteitem = this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem;
          lstQuoteList.push(quoteitem);
        }
        var rowno = 1;
        for (var item of lstQuoteList) {
          console.log('lstQuoteList', lstQuoteList)
          this.objQuote.QuoteDetail.push({
            QuotationDetailGuid: item.QuoteDetailGuid,
            Warranty: item.Warranty,
            WarrantyDescription: item.WarrantyDescription,
            ItemType: item.ItemType,
            ImageUrl: item.ImageUrl,
            DiscountCouponCode: item.DiscountCouponCode == null || item.DiscountCouponCode == undefined ? '' : item.DiscountCouponCode,
            Type: item.Type,
            ItemNo: item.ItemNo,
            ItemCode: item.ItemCode,
            ItemDescription: item.ItemDescription,
            ExchangePrice:
              item.ExchangePrice == null || item.ExchangePrice == undefined
                ? 0
                : item.ExchangePrice,
            StockPrice:
              item.StockPrice == null || item.StockPrice == undefined
                ? 0
                : item.StockPrice,
            Coverage: item.Coverage,
            CoverageDescription: item.CoverageDescription,
            ComponentCode: item.ComponentCode,
            ComponentDescription: item.ComponentDescription,
            IssueCode: item.IssueCode,
            IssueDescription: item.IssueDescription,
            Margin: item.Margin,
            PriceType: item.PriceType,
            Currency: item.Currency,
            SAC_HSNCode: item.SAC_HSNCode,
            PricingOptions:
              item.PricingOptions == null || item.PricingOptions == undefined
                ? []
                : item.PricingOptions,
            BaseAmount: item.BaseAmount,
            UnitPrice: item.UnitPrice,
            GSTJuridiction: item.GSTJuridiction,
            GSTGroupCode: item.GSTGroupCode,
            Quantity: item.Quantity,
            DiscountPercentage: item.DiscountPercentage,
            DiscountAmount: item.DiscountAmount,
            HeaderDiscountAmount: item.HeaderDiscountAmount,
            TaxableAmount: item.TaxableAmount,
            TaxPercentage:
              item.GSTPercentage == null || item.GSTPercentage == undefined
                ? 0
                : item.GSTPercentage,
            TaxAmount: item.TaxAmount,
            NetAmount: item.NetAmount,
            GSTPercentage: item.GSTPercentage,
            GSTComponentDetails: item.GSTComponentDetails,
            CGSTPercentage: (item.CGSTPercentage ==
              null || item.CGSTPercentage == undefined
              ? 0
              : item.CGSTPercentage),
            SGSTPercentage: (item.SGSTPercentage ==
              null || item.SGSTPercentage == undefined
              ? 0
              : item.SGSTPercentage),
            IGSTPercentage: (item.IGSTPercentage ==
              null || item.IGSTPercentage == undefined
              ? 0
              : item.IGSTPercentage),
            CGSTAmount: (item.CGSTAmount ==
              null || item.CGSTAmount == undefined ? 0 : item.CGSTAmount),
            SGSTAmount: (item.SGSTAmount ==
              null || item.SGSTAmount == undefined ? 0 : item.SGSTAmount),
            IGSTAmount: (item.IGSTAmount ==
              null || item.IGSTAmount == undefined ? 0 : item.IGSTAmount),
            isDeleted: item.isDeleted,
            rowno: rowno,
            PriceRangeApplicable: item?.PriceRangeApplicable,
            PriceRangeStart: item?.PriceRangeStart,
            PriceRangeEnd: item?.PriceRangeEnd,

            IsContractApplicable: item?.IsContractApplicable,
            ContractCode: item?.ContractCode,
            ContractStartDate: item?.ContractStartDate,
            ContractEndDate: item?.ContractEndDate,
            PartType : item?.PartType




          });
          rowno = rowno + 1;
        }
      }
    }
    if (changes["partlist"]) {

      let partlist = {
        rows: [],
      };




      if (
        this.partlist != null &&
        this.partlist != undefined &&
        this.partlist.length > 0
      ) {
        if (Array.isArray(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL)) {
          this.lstDiagdetail = this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL;
        } else {
          this.lstDiagdetail.push(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL);
        }

     
        // this.fetchPriceAndGSTDetails(this.partlist);

          this.getPriceForPartList()


      }
    }
    if (changes['discountApprovedObject']) {
      this.addApprovedDiscountToLineItem(this.discountApprovedObject);
    }
  }

    async getPriceForPartList(): Promise<void> {
      
      console.log('this.partlist before  ' , this.partlist)
      await this.getStockPriceBulk();         
      console.log('this.partlist after ' , this.partlist)
      this.fetchPriceAndGSTDetails(this.partlist); 
    }
      

  showDiscount(item) {
    
    if (this.quoteStatus != 'OPEN') {
      this.toaster.error('Allowed only when the Quote Status is OPEN ')
      return
    }
    console.log('item' , item);
    var objQuoteDiscountObj = {
      "CaseGUID": this.repa.CaseGUID,
      "UnitPrice": item.UnitPrice,
      "MaterialCode": item.ItemCode,
      "CustomerCode": this.repa?.CUSTOMER?.CustomerCode,
      "LocationCode": this.repa?.LocationCode,
      "DiscountCouponCode": item?.DiscountCouponCode ?? '',
      "DiscountCouponStatus": item?.DiscountCouponCode ? '' : 'APPROVED',
      "showPopUp": true,
      "PartType" : item?.PartType ?? ''
    }
    this.discountpopUp.emit(objQuoteDiscountObj)
  }

  // updateDiscountCoupon(item)
  // {
  //   
  //   this.spinner.show()
  //   let requestData = []
  //   requestData.push({
  //     "Key":"APIType",
  //     "Value":"SaveDiscount"
  //   })
  //   requestData.push({
  //     "Key":"CustomerCode",
  //     "Value":this.repa.CUSTOMER?.CustomerCode
  //   })
  //   requestData.push({
  //     "Key":"MaterialCode",
  //     "Value":item.ItemCode
  //   })
  //   requestData.push({
  //     "Key":"LocationCode",
  //     "Value":this.repa?.LocationCode
  //   })
  //   requestData.push({
  //     "Key":"CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   })
  //   requestData.push({
  //     "Key":"IsConsumed",
  //     "Value": "1"
  //   })
  //   requestData.push({
  //     "Key":"UnitPrice",
  //     "Value": item.UnitPrice
  //   })
  //   requestData.push({
  //     "Key":"DiscountAmount",
  //     "Value": item.DiscountAmount
  //   })
  //   requestData.push({
  //     "Key":"CouponCode",
  //     "Value": item.DiscountCouponCode
  //   })
  //   requestData.push({
  //     "Key":"DiscountCouponStatus",
  //     "Value": 'EXPIRED'
  //   })
  //   requestData.push({
  //     "Key":"IsInvoiceConsumed",
  //     "Value": '0'
  //   })
  //   requestData.push({
  //     "Key":"IsQuoteConsumed",
  //     "Value": '1'
  //   })
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (Value) => {
  //         this.spinner.hide()
  //         try {
  //           let response = JSON.parse(Value.toString());
  //           if (response.ReturnCode == '0') {
  //             let data = JSON.parse(response?.ExtraData);
  //             if (data.Totalrecords == "0") {
  //               this.toaster.error("Discount Consumption Error")
  //             }
  //           }
  //         } catch (ext) {
  //         }
  //       },
  //       error: err => {
  //         this.spinner.hide()
  //         console.log(err)
  //       }
  //     }
  //   ); 
  // }

  fetchPriceAndGSTDetails(partlist: any) {
    
    let RequestItemList = [];
    RequestItemList.push({
      Key: "ApiType",
      Value: "GetPriceGSTDetails",
    });
    RequestItemList.push({
      Key: "CompanyCode",
      Value: this.repa.CompanyCode,
    });
    RequestItemList.push({
      Key: "CaseGuid",
      Value: this.repa.CaseGUID,
    });
    RequestItemList.push({
      Key: "ItemType",
      Value: "MaterialCode",
    });
    RequestItemList.push({
      Key: "ItemList",
      Value: this.getPartListXml(),
    });

    console.log('RequestItemList', RequestItemList)
    let strRequestData = JSON.stringify(RequestItemList);
    console.log(strRequestData);
    let contentRequest = {
      content: strRequestData,
    };
    ;
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        this.spinner.hide();
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == "0") {
          var retValue = JSON.parse(response.ExtraData);
          console.log("Fetch Price ", retValue)
          this.updateQuoteDetails(retValue);
        } else {
          //'';
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            response["errorMessageJson"] = result;
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
  }

  updateQuoteDetails(value: any) {
    if (this.objQuote == undefined || this.objQuote == null) {
      this.objQuote = {
        QuoteGuid: uuidv4(),
        CaseGuid: this.repa.CaseGUID,
        QuoteCode: "NEW",
        NetAmount: 0,
        BaseAmount: 0,
        Currency: "INR",
        QuoteStatus: "OPEN",
        Discount: 0,
        TaxAmount: 0,
        TaxableAmount: 0,
        QuoteDate: new Date(),
        QuoteDetail: [],
        Remark: "",
      };
    }
    
    var lstSelectedItem = [];
    if (Array.isArray(value.QuoteItem)) {
      lstSelectedItem = value.QuoteItem;
    } else {
      lstSelectedItem.push(value.QuoteItem);
    }
    for (var item of lstSelectedItem) {
      var isExists = this.objQuote.QuoteDetail.filter(
        (p) => p.ItemCode == item.ItemCode
      ).length;
      if (isExists == 0) {
        var objitem = this.getQuoteItemObject(item);
        this.objQuote.QuoteDetail.push(objitem);
        this.calculateDetails(objitem);
      }
    }
    this.CreateFormControlName();
  }

  // UpdatePriceTypeChange(item) {
  //   if (item.PriceType == "ExchangePrice") {
  //     var uprice =
  //       parseFloat(item.ExchangePrice.toString()) /
  //       ((1 - parseFloat(item.Margin.toString())) / 100);
  //     item.UnitPrice = this.round(uprice);
  //   } else if (item.PriceType == "StockPrice") {
  //     var uprice =
  //       parseFloat(item.StockPrice.toString()) /
  //       ((1 - parseFloat(item.Margin.toString())) / 100);
  //     item.UnitPrice = this.round(uprice);
  //   }
  //   item.BaseAmount = item.UnitPrice;
  //   item.TaxableAmount = this.round(
  //     item.UnitPrice - parseFloat(item.DiscountAmount.toString())
  //   );
  //   item.TaxAmount = this.round(
  //     (parseFloat(item.TaxableAmount.toString()) *
  //       parseFloat(item.GSTPercentage.toString())) /
  //     100
  //   );
  //   item.NetAmount = this.round(
  //     parseFloat(item.TaxableAmount.toString()) +
  //     parseFloat(item.TaxAmount.toString())
  //   );
  //   this.calculateDetails();
  // }

  // calculateDetails() {
  //   var NetAmount = 0;
  //   var BaseAmount = 0;
  //   var TaxAmount = 0;
  //   var TaxableAmount = 0;
  //   var Discount = 0;
  //   for (var item of this.objQuote.QuoteDetail) {
  //     if (item.isDeleted == false) {
  //       BaseAmount = BaseAmount + parseFloat(item.BaseAmount.toString());
  //       TaxableAmount =
  //         TaxableAmount + parseFloat(item.TaxableAmount.toString());
  //       TaxAmount = TaxAmount + parseFloat(item.TaxAmount.toString());
  //       Discount = Discount + parseFloat(item.DiscountAmount.toString()) +parseFloat(item.HeaderDiscountAmount.toString());
  //     }
  //     item.CGSTAmount = this.round(
  //       (parseFloat(TaxableAmount.toString()) *
  //         parseFloat(item.CGSTPercentage.toString())) /
  //       100
  //     );
  //     item.SGSTAmount = this.round(
  //       (parseFloat(TaxableAmount.toString()) *
  //         parseFloat(item.SGSTPercentage.toString())) /
  //       100
  //     );
  //     item.IGSTAmount = this.round(
  //       (parseFloat(TaxableAmount.toString()) *
  //         parseFloat(item.IGSTPercentage.toString())) /
  //       100
  //     );
  //   }
  //   this.objQuote.BaseAmount = parseFloat(TaxableAmount.toFixed(2));
  //   this.objQuote.TaxAmount = parseFloat(TaxAmount.toFixed(2));
  //   this.objQuote.NetAmount = parseFloat(
  //     (TaxableAmount + TaxAmount - Discount).toFixed(2)
  //   );
  //   this.objQuote.Discount = Discount;
  // }

  calculateDetails(item) {
    
    console.log(item)
    const PartApplicableForDiscount_AMC = this.AmcTypeMasterDetailsList.find(a => item.ItemCode == a.PartNumber)
    const ContractCodeApplicableForPartDiscount = this.repa?.ContractCodeObject?.NoOfTimesUsed <= 3;
    console.log('this.repa?.ContractCodeObject?', this.repa?.ContractCodeObject)

    const PartDiscountPercentage_AMC = this.repa?.ContractCodeObject?.PartDiscountPercentage
    const DiscountPercentage_AMC = this.repa?.ContractCodeObject?.DiscountPercentage



    if (this.ContractApplicable && !PartApplicableForDiscount_AMC) {
      const safeRound = (value) => isNaN(value) ? 0 : Math.round(value * 100) / 100;
      const ContractDiscount = safeRound((DiscountPercentage_AMC / 100) * item.BaseAmount)
      // item.BaseAmount = safeRound(item.BaseAmount - FivePerContractDiscount)
      item.DiscountAmount = ContractDiscount
      item.DiscountCouponCode  = this.repa?.ContractCode ?? ''
      item.BaseAmount = safeRound(item.UnitPrice * item.Quantity);
      item.TaxableAmount = safeRound(item.BaseAmount - item.DiscountAmount);
      item.SGSTAmount = safeRound(item.TaxableAmount * (item.SGSTPercentage / 100));
      item.CGSTAmount = safeRound(item.TaxableAmount * (item.CGSTPercentage / 100));
      item.IGSTAmount = safeRound(item.TaxableAmount * (item.IGSTPercentage / 100));
      item.GSTAmount = safeRound(item.TaxableAmount * (item.GSTPercentage / 100));
      item.TaxAmount = safeRound(item.GSTAmount);
      item.NetAmount = safeRound(item.TaxableAmount + item.TaxAmount);
    }

    else if (PartApplicableForDiscount_AMC && ContractCodeApplicableForPartDiscount) {
      const safeRound = (value) => isNaN(value) ? 0 : Math.round(value * 100) / 100;
      const PartContractDiscount = safeRound((PartDiscountPercentage_AMC / 100) * item.BaseAmount)
      // item.BaseAmount = safeRound(item.BaseAmount - FivePerContractDiscount)
      item.DiscountAmount = PartContractDiscount
      item.DiscountCouponCode  = this.repa?.ContractCode ?? ''
      item.BaseAmount = safeRound(item.UnitPrice * item.Quantity);
      item.TaxableAmount = safeRound(item.BaseAmount - item.DiscountAmount);
      item.SGSTAmount = safeRound(item.TaxableAmount * (item.SGSTPercentage / 100));
      item.CGSTAmount = safeRound(item.TaxableAmount * (item.CGSTPercentage / 100));
      item.IGSTAmount = safeRound(item.TaxableAmount * (item.IGSTPercentage / 100));
      item.GSTAmount = safeRound(item.TaxableAmount * (item.GSTPercentage / 100));
      item.TaxAmount = safeRound(item.GSTAmount);
      item.NetAmount = safeRound(item.TaxableAmount + item.TaxAmount);
    }


    else {
      const safeRound = (value) => isNaN(value) ? 0 : Math.round(value * 100) / 100;
      item.BaseAmount = safeRound(item.UnitPrice * item.Quantity);
      item.TaxableAmount = safeRound(item.BaseAmount - item.DiscountAmount);
      item.SGSTAmount = safeRound(item.TaxableAmount * (item.SGSTPercentage / 100));
      item.CGSTAmount = safeRound(item.TaxableAmount * (item.CGSTPercentage / 100));
      item.IGSTAmount = safeRound(item.TaxableAmount * (item.IGSTPercentage / 100));
      item.GSTAmount = safeRound(item.TaxableAmount * (item.GSTPercentage / 100));
      item.TaxAmount = safeRound(item.GSTAmount);
      item.NetAmount = safeRound(item.TaxableAmount + item.TaxAmount);
    }


    this.TotalNetAmount();
  }

  TotalNetAmount() {
    this.objQuote.BaseAmount = 0;
    this.objQuote.Discount = 0;
    this.objQuote.NetAmount = 0;
    this.objQuote.TaxAmount = 0;
    this.objQuote.TaxableAmount = 0;

    this.objQuote.QuoteDetail.forEach((item) => {

      if (item.isDeleted == false) {
        this.objQuote.TaxableAmount += Math.round(item.TaxableAmount * 100) / 100;
        this.objQuote.TaxAmount += Math.round(item.TaxAmount * 100) / 100;
        this.objQuote.Discount += Math.round(item.DiscountAmount * 100) / 100;
        this.objQuote.BaseAmount += Math.round(item.BaseAmount * 100) / 100;

        // Calculate NetAmount and round it
        let netAmount = Number(item.NetAmount);
        let decimalPart = netAmount - Math.floor(netAmount);

        if (decimalPart < 0.5) {
          item.NetAmount = Math.floor(netAmount);
        } else {
          item.NetAmount = Math.ceil(netAmount);
        }

        this.objQuote.NetAmount += Math.round(item.NetAmount * 100) / 100;
      }

    });

    // Round all totals to 2 decimal places
    this.objQuote.TaxableAmount = Math.round(this.objQuote.TaxableAmount * 100) / 100;
    this.objQuote.TaxAmount = Math.round(this.objQuote.TaxAmount * 100) / 100;
    this.objQuote.Discount = Math.round(this.objQuote.Discount * 100) / 100;
    this.objQuote.BaseAmount = Math.round(this.objQuote.BaseAmount * 100) / 100;

    this.spinner.hide();

  }


  // TotalNetAmount() {
  //   this.objQuote.BaseAmount = 0;
  //   this.objQuote.Discount  = 0;
  //   this.objQuote.NetAmount = 0;
  //   this.objQuote.TaxAmount = 0;
  //   this.objQuote.TaxableAmount = 0;

  //   this.objQuote.QuoteDetail.forEach((item) => {
  //     this.objQuote.TaxableAmount += Number(item.TaxableAmount);
  //     this.objQuote.TaxAmount  += Number(item.TaxAmount);
  //     this.objQuote.Discount += Number(item.DiscountAmount);
  //     this.objQuote.BaseAmount += Number(item.BaseAmount);
  //     // Calculate NetAmount and round it
  //     let netAmount = Number(item.NetAmount);
  //     let decimalPart = netAmount - Math.floor(netAmount);
  //     if (decimalPart < 0.5) {
  //         item.NetAmount = Math.floor(netAmount);
  //     } else {
  //         item.NetAmount = Math.ceil(netAmount);
  //     }
  //     this.objQuote.NetAmount += Number(item.NetAmount);
  //   });

  //   // Round all totals to 2 decimal places
  //   this.objQuote.TaxableAmount = Number(this.objQuote.TaxableAmount);
  //   this.objQuote.TaxAmount  = Number(this.objQuote.TaxAmount );
  //   this.objQuote.Discount = Number( this.objQuote.Discount );
  //   this.objQuote.BaseAmount = Number( this.objQuote.BaseAmount)
  // }

  getQuoteItemObject(item) {
    
    var margin = item.Margin == null ? 0 : parseFloat(item.Margin);
    var price = item.UnitPrice == null ? 0 : parseFloat(item.UnitPrice);
    var qty = item.Quantity == null ? 0 : parseFloat(item.Quantity);
    var taxpercentage =
      item.GSTPercentage == null ? 0 : parseFloat(item.GSTPercentage);
    var unitprice = parseFloat((price / (1 - margin / 100)).toFixed(2));
    var baseamount = parseFloat((qty * unitprice).toFixed(2));
    var taxamount = parseFloat((baseamount * (taxpercentage / 100)).toFixed(2));
    var netamount = parseFloat((baseamount + taxamount).toFixed(2));
    var rowno = this.objQuote?.QuoteDetail?.length + 1;

    var objquoteitem = {
      QuotationDetailGuid: item.QuoteDetailGUID,
      Warranty: item.Warranty,
      WarrantyDescription: item.WarrantyDescription,
      ItemType: item.ItemType,
      ImageUrl: item.ImageUrl,
      DiscountCouponCode: item.DiscountCouponCode,
      Type: item.Type,
      ItemNo: this.objQuote.QuoteDetail.length + 1,
      ItemCode: item.ItemCode,
      ItemDescription: item.ItemDescription,
      ExchangePrice:
        item.ExchangePrice == null || item.ExchangePrice == undefined
          ? 0
          : item.ExchangePrice,
      StockPrice:
        item.StockPrice == null || item.StockPrice == undefined
          ? 0
          : item.StockPrice,
      Coverage: item.Coverage,
      CoverageDescription: item.CoverageDescription,
      ComponentCode: item.ComponentCode,
      ComponentDescription: item.ComponentDesc,
      IssueCode: item.IssueCode,
      IssueDescription: item.IssueDesc,
      Margin: margin,
      PriceType: item.PriceType,
      Currency: item.Currency,
      SAC_HSNCode: item.SAC_HSNCode,
      BaseAmount: baseamount,
      UnitPrice: unitprice,
      GSTJuridiction: item.GSTJuridiction,
      GSTGroupCode: item.GSTGroupCode,
      Quantity: item.Quantity,
      DiscountPercentage: 0,
      DiscountAmount: 0,
      HeaderDiscountAmount: 0,
      TaxableAmount: baseamount,
      TaxPercentage:
        item.GSTPercentage == null || item.GSTPercentage == undefined
          ? 0
          : item.GSTPercentage,
      TaxAmount: taxamount,
      NetAmount: netamount,
      PricingOptions:
        item.PricingOptions == null || item.PricingOptions == undefined
          ? []
          : item.PricingOptions,
      GSTComponentDetails: item.GSTComponentDetails,
      CGSTPercentage: (item.CGSTPercentage ==
        null || item.CGSTPercentage == undefined ? 0 : item.CGSTPercentage),
      SGSTPercentage: (item.SGSTPercentage ==
        null || item.SGSTPercentage == undefined ? 0 : item.SGSTPercentage),
      IGSTPercentage: (item.IGSTPercentage ==
        null || item.IGSTPercentage == undefined ? 0 : item.IGSTPercentage),
      CGSTAmount: (item.CGSTAmount ==
        null || item.CGSTAmount == undefined ? 0 : item.CGSTAmount),
      SGSTAmount: (item.SGSTAmount ==
        null || item.SGSTAmount == undefined ? 0 : item.SGSTAmount),
      IGSTAmount: (item.IGSTAmount ==
        null || item.IGSTAmount == undefined ? 0 : item.IGSTAmount),
      GSTPercentage: item.GSTPercentage,
      isDeleted: false,
      rowno: rowno,
      PriceRangeApplicable: item?.PriceRangeApplicable,
      PriceRangeStart: item?.PriceRangeStart,
      PriceRangeEnd: item?.PriceRangeEnd,

      IsContractApplicable: item?.IsContractApplicable,
      ContractCode: item?.ContractCode,
      ContractStartDate: item?.ContractStartDate,
      ContractEndDate: item?.ContractEndDate,
            PartType : item?.PartType,

    };
    return objquoteitem;
  }

  getPartListXml() {
    
    let rawData = {
      rows: [],
    };
    for (let item of this.partlist) {
      if (item.stockPrice == null || item.stockPrice == undefined) {
        //''
      }
      
      console.log('item', item)
      rawData.rows.push({
        row: {
          ItemType: "Material",
          ItemCode: item.number,
          ExchangePrice: this.dynamicService.removeCommas(
            item.exchangePrice == null || item.exchangePrice == undefined
              ? "0"
              : item.exchangePrice
          ),
          StockPrice: this.dynamicService.removeCommas(
            item.stockPrice == null || item.stockPrice == undefined
              ? "0"
              : item.stockPrice
          ), //==undefined?0:this.dynamicService.removeCommas(item.stockPrice),
          ImageUrl: item.imageUrl,
          Type: item.type,
          DiscountCouponCode: '',
          Billable: item.billable == true ? 1 : 0,
          Coverage: this.repa?.DIAG?.BillingOption,
          CoverageDescription: this.repa?.DIAG?.BillingOption,
          ItemDescription: item.description,
          Warranty: this.repa?.GSXWarrantyStatusCode,
          WarrantyDescription: this.repa?.GSXWarrantyStatusDesc,
          ComponentCode: this.lstDiagdetail[0]?.ComponentCode,
          ComponentDesc: this.lstDiagdetail[0]?.ComponentDesc,
          IssueCode: this.lstDiagdetail[0]?.IssueCode,
          IssueDesc: this.lstDiagdetail[0]?.IssueDesc,
          Quantity: 1,
          PricingOptions:
            item.PricingOptions == null || item.PricingOptions == undefined
              ? []
              : item.PricingOptions,

          PriceType: item?.PriceType == null || item?.PriceType == undefined ? 'StockPrice' : item?.PriceType,

          // UnitPrice: item?.PriceType == null || item?.PriceType == undefined ? (this.dynamicService.removeCommas(item?.stockPrice == null || item?.stockPrice == undefined ? "0" : item?.stockPrice)) : (this.dynamicService.removeCommas(item?.tem?.exchangePrice == null || item?.tem?.exchangePrice == undefined ? "0" : item?.tem?.exchangePrice)),
          UnitPrice : item?.UnitPrice ?? 0

        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    //xml = xml.split(' ').join('')
    console.log("xml", xml);
    return xml;
  }

  validateQuotation() {
    for (let item of this.objQuote.QuoteDetail) {
      
      if (item.UnitPrice < item.DiscountAmount) {
        this.toaster.error("Discount Amount cannot be greater than the Net Amount in Part Number", item.ItemCode);
        return false
      }

      if (item.TaxAmount < 0) {
        this.toaster.error("Invalid Tax Amount for this Part: ", item.ItemCode);
        return false
      }
      if (item?.PriceRangeApplicable == true) {
        if (item.UnitPrice < item.PriceRangeStart) {
          this.toaster.error(`Unit Price Cannot be less than Price Range Start for Item Code ${item.ItemCode} `);
          return false
        }
        if (item.UnitPrice > item.PriceRangeEnd) {
          this.toaster.error(`Unit Price Cannot be less than Price Range End for Item Code ${item.ItemCode} `);
          return false
        }
      }

    }
    return true
  }

  onSubmit() {
    if (!this.validateQuotation()) {
      return
    }

    

    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "SaveQuote4Job",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CaseGuid",
      Value: this.repa.CaseGUID,
    });
    requestData.push({
      Key: "QuoteCode",
      Value: this.objQuote.QuoteCode,
    });
    requestData.push({
      Key: "QuoteGuid",
      Value: this.objQuote.QuoteGuid,
    });
    requestData.push({
      Key: "QuoteDate",
      Value: this.objQuote.QuoteDate,
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.repa.LocationCode,
    });
    requestData.push({
      Key: "RetailCustomerCode",
      Value: this.repa.CUSTOMER.CustomerCode,
    });
    requestData.push({
      Key: "TotalBaseAmount",
      Value: this.objQuote.BaseAmount,
    });
    requestData.push({
      Key: "TotalDiscountAmount",
      Value: this.objQuote.Discount,
    });
    requestData.push({
      Key: "TotalTaxableAmount",
      Value: this.objQuote.TaxableAmount,
    });
    requestData.push({
      Key: "TotalTaxAmount",
      Value: this.objQuote.TaxAmount,
    });
    requestData.push({
      Key: "TotalNetAmount",
      Value: this.objQuote.NetAmount,
    });
    requestData.push({
      Key: "QuoteStatus",
      Value: this.quoteStatus == null || this.quoteStatus == undefined ? this.objQuote.QuoteStatus : this.quoteStatus
    });
    requestData.push({
      Key: "RejectReason",
      Value: this.RejectQuoteReason ?? '' 
    });
    requestData.push({
      Key: "QuotationDetails",
      Value: this.saveQuoteListXml(),
    });
    requestData.push({
      Key: "IsInsuranceApplicable",
      Value: this.repa.CUSTOMER?.IsInsuranceApplicable ?? 0
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.spinner.show();
    // alert("UAT Testing ")
    console.log("Quote ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        this.spinner.hide();
        let response = JSON.parse(value.toString());

        if (response.ReturnCode == "0") {
          var data = JSON.parse(response.ExtraData);
          this.UpdateQuote.emit(data.QUOTE);
          this.toaster.success("Submitted Succesfully");
        }
        else {
          console.log("Messages : ", response)
          this.errorMessage = response.ErrorMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(this.errorMessage, (error, result) => {
            console.log("Error Message: ", error)
            const errorMessages = result.ERRORLIST.ERRORMESSAGE;
            errorMessages.forEach((errorMessage) => {
              this.toaster.error(errorMessage.ERRORMESSAGE);
            });
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
  }

  get_Component_Issue() {
    if (this.repa == undefined) {
      return;
    }
    let searchData = { device: { id: this.repa?.SerialNo1 } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      content: strRequestData,
    };
    this.spinner.show();
    this.gsxService.getComponentIssue(contentRequest).subscribe({
      next: (value) => {
        this.spinner.hide();
        let response = JSON.parse(value.toString());
        this.ComponentIssueList = response.componentIssues;
        this.ComponentList = this.ComponentIssueList;
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
  }

  onCoverageSubmit(item) {
    var rowno = item.rowno;
    item.Coverage = this.quoteForm.controls["CoverageOption" + rowno.toString()].value.Id;
    item.CoverageDescription = this.quoteForm.controls["CoverageOption" + rowno.toString()].value.TEXT;
    item.isCoverage = !item.isCoverage;
  }

  pricetype = "";

  async onPriceType(item) {
    this.spinner.show();
    
    console.log('onPriceType item', item)
    
    this.isPriceTypeFuc(item);
    var rowno = item.rowno;
    item.PriceType = this.quoteForm.controls["PriceType" + rowno.toString()].value;
    this.pricetype = this.quoteForm.controls["PriceType" + rowno.toString()].value;

    // const gsxPrice = 
    await this.getStockPrice(item);

    //  item.UnitPrice = gsxPrice; 

    // console.log('returned  gsxPrice' , gsxPrice )

    let rawData = {
      rows: [],
    };
    rawData.rows.push({
      row: {
        ItemType: item?.ItemType,
        InvoiceDetailGUID: uuidv4(),
        ItemCode: item.ItemCode,
        ItemDescription: item.MaterialName,
        Type: "",
        ImageUrl: item.ImageUrl,
        ProductCategory: "",
        Quantity: item.Quantity,
        Billable: 1,
        UnitPrice: this.dynamicService.removeCommas(item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString()),
        PricingOptions: item.PriceType,

      },
    });
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    let requestdata = [];
    requestdata.push({
      Key: "ApiType",
      Value: "GetAccessoryPriceDetails",
    });
    requestdata.push({
      Key: "ItemType",
      Value: "MaterialCode",
    });
    requestdata.push({
      Key: "ItemList",
      Value: xml,
    });
    requestdata.push({
      Key: "CustomerCode",
      Value: this.repa?.CUSTOMER.CustomerCode,
    });
    requestdata.push({
      Key: "LocationCode",
      Value: this.repa?.LocationCode,
    });
    requestdata.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });

    console.log('requestdata on price type ', requestdata);

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = {
      content: strRequestData,
    };
    // this.spinner.show();

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (response: any) => {
        // this.spinner.hide();
        let data = JSON.parse(response);
        if (data.ReturnCode == "0") {
          let extraData = JSON.parse(data.ExtraData);
          if (Array.isArray(extraData?.QuoteItem)) {
            for (let object of extraData?.QuoteItem) {
              for (let item of this.objQuote.QuoteDetail) {
                if (item?.ItemCode == object.ItemCode) {
                  if (this.repa.CUSTOMER?.GSTRegistrationType == "GSEZ") {
                    item.CGSTPercentage = 0;
                    item.GSTPercentage = 0;
                    item.SGSTPercentage = 0;
                    item.IGSTPercentage = 0;
                  } else {
                    item.CGSTPercentage = object.CGSTPercentage;
                    item.GSTPercentage = object.GSTPercentage;
                    item.SGSTPercentage = object.SGSTPercentage;
                    item.IGSTPercentage = object.IGSTPercentage;
                  }
                  item.Margin = 0; // (parseFloat(object.StockPrice) / ( 1 - (object.Margin / 100)))-parseFloat(object.StockPrice)
                  item.SAC_HSNCode = object.SAC_HSNCode;
                  item.DiscountAmount = 0.0;
                  item.UnitPrice =
                    object.UnitPrice == undefined || object.UnitPrice == null
                      ? 0
                      : parseFloat(object.UnitPrice);
                  item.BaseAmount = item.UnitPrice * item.Quantity;
                  item.TaxableAmount = item.BaseAmount - item.DiscountAmount;
                  item.SGSTAmount =
                    item.TaxableAmount * (item.SGSTPercentage / 100);
                  item.CGSTAmount =
                    item.TaxableAmount * (item.CGSTPercentage / 100);
                  item.IGSTAmount =
                    item.TaxableAmount * (item.IGSTPercentage / 100);
                  item.TaxAmount =
                    item.TaxableAmount * (item.GSTPercentage / 100);
                  item.NetAmount = item.TaxableAmount + item.TaxAmount;
                  item.ItemType = object.ItemType;
                  item.GSTGroupCode = object.GSTGroupCode;
                  this.calculateDetails(item);
                }
              }
            }
          } else {
            for (let obj of this.objQuote.QuoteDetail) {
              if (obj.ItemCode === extraData?.QuoteItem.ItemCode) {
                if (this.repa.CUSTOMER?.GSTRegistrationType == "GSEZ") {
                  obj.CGSTPercentage = 0;
                  obj.GSTPercentage = 0;
                  obj.SGSTPercentage = 0;
                  obj.IGSTPercentage = 0;
                } else {
                  obj.CGSTPercentage = extraData?.QuoteItem.CGSTPercentage;
                  obj.GSTPercentage = extraData?.QuoteItem.GSTPercentage;
                  obj.SGSTPercentage = extraData?.QuoteItem.SGSTPercentage;
                  obj.IGSTPercentage = extraData?.QuoteItem.IGSTPercentage;
                }
                obj.UnitPrice =
                  extraData?.QuoteItem?.UnitPrice == undefined ||
                    extraData?.QuoteItem?.UnitPrice == null
                    ? 0
                    : parseFloat(extraData?.QuoteItem?.UnitPrice);
                obj.Margin = 0;
                obj.SAC_HSNCode = extraData?.QuoteItem.SAC_HSNCode;
                obj.DiscountAmount = 0.0;
                obj.BaseAmount = obj.UnitPrice * obj.Quantity;
                obj.TaxableAmount = obj.BaseAmount - obj.DiscountAmount;
                obj.SGSTAmount = obj.TaxableAmount * (obj.SGSTPercentage / 100);
                obj.CGSTAmount = obj.TaxableAmount * (obj.CGSTPercentage / 100);
                obj.IGSTAmount = obj.TaxableAmount * (obj.IGSTPercentage / 100);
                obj.TaxAmount = obj.TaxableAmount * (obj.GSTPercentage / 100);
                obj.ItemType = extraData?.QuoteItem?.ItemType;
                obj.GSTGroupCode = extraData?.QuoteItem?.GSTGroupCode;
                obj.NetAmount = obj.TaxableAmount + obj.TaxAmount;
                obj.GSTGroupCode = extraData?.QuoteItem.GSTGroupCode;
                this.calculateDetails(obj);
              }
            }
          }
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
    // this.UpdatePriceTypeChange(item)
  }




  async getStockPrice(item): Promise<void> {

    

    try {
      const data = {
        Content: JSON.stringify({
          partNumbers: [item.ItemCode]
        })
      };

      const value = await this.gsxService
        .getPartsSummary(data)
        .toPromise();

      const response = JSON.parse(value.toString());

      const matched = response.find(x => x?.number === item?.ItemCode);
      
      let gsxPrice = 0;
      //   item.PriceType === 'ExchangePrice'
      //     ? this.dynamicService.removeCommas(matched?.exchangePrice ?? 0)
      //     : this.dynamicService.removeCommas(matched?.stockPrice ?? 0);

      if (item.PriceType === 'ExchangePrice') {
        gsxPrice = this.dynamicService.removeCommas(matched?.exchangePrice ?? 0)
        item.UnitPrice = this.dynamicService.removeCommas(matched?.exchangePrice ?? 0)
      }
      else if (item.PriceType === 'StockPrice') {
        gsxPrice = this.dynamicService.removeCommas(matched?.stockPrice ?? 0);
        item.UnitPrice = this.dynamicService.removeCommas(matched?.stockPrice ?? 0);
      }
      else {
        const option = matched?.pricingOptions?.find(x => x?.description === item.PriceType);
        gsxPrice = this.dynamicService.removeCommas(option?.price ?? 0);
        item.UnitPrice = this.dynamicService.removeCommas(option?.price ?? 0);
      }

      // return gsxPrice;

    } catch (err) {
      // return 0;
      console.log(err)
    } finally {
      this.spinner.hide();
    }
  }


  // 

  onComponentIssuesSubmit(item) {
    this.issueshoverFunc(item);
    var rowno = item.rowno;
    item.ComponentCode =
      this.quoteForm.controls[
        "component" + rowno.toString()
      ].value.componentCode;
    item.IssueCode =
      this.quoteForm.controls["issues" + rowno.toString()].value.code;
    item.ComponentDescription =
      this.quoteForm.controls[
        "component" + rowno.toString()
      ].value.componentDescription;
    item.IssueDescription =
      this.quoteForm.controls["issues" + rowno.toString()].value.description;
  }

  saveQuoteListXml() {
    let rawData = {
      rows: [],
    };
    console.log("Quote ", this.objQuote.QuoteDetail)
    for (let items of this.objQuote.QuoteDetail) {
      rawData.rows.push({
        row: {
          QuoteDetailGuid: items.QuotationDetailGuid,
          QuoteGUID: this.objQuote.QuoteGuid,
          ItemType: items.ItemType,
          DiscountCouponCode: items?.DiscountCouponCode,
          Type: items.Type,
          ItemCode: items.ItemCode,
          ItemDescription: items.ItemDescription,
          ImageUrl: items.ImageUrl,
          ComponentCode: items.ComponentCode,
          ComponentDescription: items.ComponentDescription,
          IssueCode: items.IssueCode,
          IssueDescription: items.IssueDescription,
          Coverage: items.Coverage,
          CoverageDescription: items.CoverageDescription,
          Warranty: items.Warranty,
          WarrantyDescription: items.WarrantyDescription,
          GSTGroupCode:
            items.GSTGroupCode == null || items.GSTGroupCode == undefined
              ? ""
              : items.GSTGroupCode,
          GSTJuridiction:
            items.GSTJuridiction == null || items.GSTJuridiction == undefined
              ? ""
              : items.GSTJuridiction,
          SAC_HSNCode:
            items.SAC_HSNCode == null || items.SAC_HSNCode == undefined
              ? ""
              : items.SAC_HSNCode,
          Quantity: items.Quantity,
          UnitPrice: items.UnitPrice,
          BaseAmount: items.BaseAmount,
          DiscountAmount: items.DiscountAmount,
          TaxableAmount: items.TaxableAmount,
          TaxPercentage: items.TaxPercentage,
          NetAmount: items.NetAmount,
          TaxAmount: items.TaxAmount,
          PriceType: items.PriceType,
          PricingOptions: items.PricingOptions,
          GSTPercentage: items.GSTPercentage,
          CGSTPercentage: items.CGSTPercentage,
          SGSTPercentage: items.SGSTPercentage,
          IGSTPercentage: items.IGSTPercentage,
          CGSTAmount: items.CGSTAmount,
          SGSTAmount: items.SGSTAmount,
          IGSTAmount: items.IGSTAmount,
          StockPrice: items.StockPrice,
          ExchangePrice: items.ExchangePrice,
          Margin: items.Margin,
          isDeleted: items.isDeleted == undefined ? 0 : items.isDeleted,

          PriceRangeApplicable: items?.PriceRangeApplicable,
          PriceRangeStart: items?.PriceRangeStart,
          PriceRangeEnd: items?.PriceRangeEnd,

          IsContractApplicable: items?.IsContractApplicable == null || items?.IsContractApplicable == undefined ? this.IsContractApplicable : items?.IsContractApplicable,
          ContractCode: items?.ContractCode == null || items?.ContractCode == undefined ? this.ContractCode : items?.ContractCode,
          ContractStartDate: items?.ContractStartDate == null || items?.ContractStartDate == undefined ? this.ContractStartDate : items?.ContractStartDate,
          ContractEndDate: items?.ContractEndDate == null || items?.ContractEndDate == undefined ? this.ContractEndDate : items?.ContractEndDate,
           PartType : items?.PartType
        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log("xml ", xml)
    return xml;
  }

  show = false;
  Show() {
    this.show = !this.show;
  }

  showTotal() {
    if (this.isShowTotal == true) {
      this.isShowTotal = false;
    } else {
      this.isShowTotal = true;
    }
  }

  quoteSatusChange = "";

  updatequoteStatus() {
    
    if(this.quoteSatusChange == 'REJECTED' && (this.RejectQuoteReason == '' || this.RejectQuoteReason == null || this.RejectQuoteReason == undefined) ){
       this.toaster.error('Please select Quote Reject Reason')
       return
     }
     if(this.quoteSatusChange == 'REJECTED'){
           this.UpdateQuotationRejectReason()
     }

    
    this.onQuoteStatus();
    ("");
    this.quoteStatus = this.quoteSatusChange;
    this.update_quote();
    this.setQuoteStatus.emit(this.quoteStatus);
    this.UpdateQuoteStatus();
  }

  click(item) {
    item.isDeleted = !item.isDeleted;
  }

  update_quote() {
    this.dynamicService
      .setGuestQuoteStatus(this.newquoteGuid, this.quoteStatus)
      .subscribe({
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            this.toaster.success("Quote Status Updated");
            var getval = JSON.parse(response.ExtraData);
            this.quoteStatus;
          } else {
            console.log("else");
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  // add_Discount_quote() {
  //   this.calculateDetails();
  //   this.quoteStatus = "DISCOUNTAPPROVAL";
  //   this.dynamicService.setGuestQuoteStatus(this.newquoteGuid, this.quoteStatus).subscribe({
  //       next: (value) => {
  //         let response = JSON.parse(value.toString());
  //         if (response.ReturnCode == "0") {
  //           this.toaster.success("Quote Status Updated");
  //           // this.onSubmit;
  //           var getval = JSON.parse(response.ExtraData);
  //           this.quoteStatus;
  //         } else {
  //           console.log("else");
  //         }
  //       },
  //       error: (err) => {
  //         console.log(err);
  //       },
  //     });

  //   this.setQuoteStatus.emit(this.quoteStatus);
  //   this.isShowTotal = false;
  // }

  round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  isDeletedItem(item) {
    //item.isDeleted = !item.isDeleted
  }

  isDeleteStatus = "";

  removeItem(item) {
    item.isDeleted = item.isDeleted == 1 ? 0 : 1;
    this.calculateDetails(item)
  }

  onHeaderDiscountAmount(item) {
    var rowno = item.rowno;
    item.DiscountAmount = this.quoteForm.controls["DiscountAmount" + rowno.toString()].value;
    item.DiscountPercentage = this.round(item.DiscountAmount / item.BaseAmount / 100);
    item.TaxableAmount = item.BaseAmount - item.DiscountAmount;
    item.TaxAmount = this.round((parseFloat(item.TaxableAmount.toString()) * parseFloat(item.GSTPercentage.toString())) / 100);
    this.calculateDetails(item);
    // this.add_Discount_quote();
    this.onSubmit();
  }


  button() {
    this.router.navigate(["/authentication/" + "/customer-invoice"], {
      queryParams: { guid: this.repa.CaseGUID },
    });
  }



  onUnitPriceChange(item) {
    
    console.log('item from onUnitPriceChange ', item)

    if (item?.UnitPrice == null || item?.UnitPrice == undefined) {
      this.toaster.error('Invalid Unit Price...')
      return
    }

    item.UnitPrice = parseFloat(Number(item.UnitPrice).toFixed(2));

    if (item?.UnitPrice < item.PriceRangeStart) {
      this.toaster.error(`Unit Price cannot be Less than Price Range Start for Item code ${item?.ItemCode}`)
      return
    }
    if (item?.UnitPrice > item.PriceRangeEnd) {
      this.toaster.error(`Unit Price cannot be greater than Price Range End for Item code ${item?.ItemCode}`)
      return
    }

    this.calculateDetails(item);

  }




  GetAmcTypeMasterDetailsList() {
    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetAmcTypeMasterDetailsList"
    })
    
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
              
              if (Array.isArray(data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails)) {
                this.AmcTypeMasterDetailsList = data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails
              }
              else {
                this.AmcTypeMasterDetailsList.push(data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails)
              }
            }
            console.log('this.AmcTypeMasterDetailsList', this.AmcTypeMasterDetailsList)
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



  // bulk

  async getStockPriceBulk(): Promise<void> {
    

    let tempSelectedElements = [...this.partlist];
    let apiCalls: Promise<void>[] = [];

    while (tempSelectedElements.length > 0) {

      const partlist = tempSelectedElements
        .splice(0, 5)
        .map(x => x?.ItemCode);

      const requestdata = { partNumbers: partlist };
      const data = { Content: JSON.stringify(requestdata) };

      apiCalls.push(
        new Promise<void>((resolve, reject) => {

          this.gsxService.getPartsSummary(data).subscribe({
            next: (value) => {

              const response = JSON.parse(value.toString());
              console.log('api response ', response);

              if (response?.errors?.length) {
                response.errors.forEach(err =>
                  this.toaster.error(
                    `${err.code} - ${err.message}`,
                    'Error',
                    { closeButton: true, disableTimeOut: true }
                  )
                );
              } else {
                for (let object of response) {
                  for (let item of this.partlist) {
                    if (item.ItemCode === object.number) {
                      


                      if (item.PriceType === 'ExchangePrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.exchangePrice ?? 0)
                      }
                      else if (item.PriceType === 'StockPrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.stockPrice ?? 0);
                      }
                      else {
                        const option = object?.pricingOptions?.find(x => x?.description === item.PriceType);
                        item.UnitPrice = this.dynamicService.removeCommas(option?.price ?? 0);
                      }
                    }
                  }
                }
              }
            },
            error: err => {
              this.toaster.error('Please try again. ' + err);
              reject(err);
            },
            complete: () => {
              
              resolve();
            }
          });

        })
      );
    }
    try {
      await Promise.all(apiCalls);
      this.spinner.hide();
      console.log('getStockPrice fully completed');
    } catch (err_3) {
      this.spinner.hide();
      throw err_3;
    }
  }



  UpdateQuotationRejectReason(){
    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "UpdateQuotationRejectReason",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CaseGUID",
      Value: this.repa.CaseGUID,
    });
    requestData.push({
      Key: "QuoteGUID",
      Value: this.objQuote.QuoteGuid,
    });
    requestData.push({
      Key: "RejectReason",
      Value: this.RejectQuoteReason ?? '',
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.spinner.show();
    console.log("UpdateQuotationRejectReason ", requestData)
 
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        this.spinner.hide();
        let response = JSON.parse(value.toString());

        if (response.ReturnCode == "0") {
            console.log('Reject Reason Updated Successfully !');
           location.reload();

        }
        else {
          console.log("Messages : ", response)
          this.errorMessage = response.ErrorMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(this.errorMessage, (error, result) => {
            console.log("Error Message: ", error)
            const errorMessages = result.ERRORLIST.ERRORMESSAGE;
            errorMessages.forEach((errorMessage) => {
              this.toaster.error(errorMessage.ERRORMESSAGE);
            });
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });

  }

}