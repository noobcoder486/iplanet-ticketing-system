import { Component, OnInit } from '@angular/core';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute } from '@angular/router';
import * as glob from 'src/app/config/global'
import xml2js from 'xml2js';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tradein',
  templateUrl: './tradein.component.html',
  styleUrls: ['./tradein.component.sass']
})
export class TradeinComponent implements OnInit {


  TradeinCategoryDD: DropDownValue = DropDownValue.getBlankObject();
  TradeinPartnerDD: DropDownValue = DropDownValue.getBlankObject();
  TradeinCategory: any;
  Remark: any
  TransactionNo: any
  params: any;
  tradeinObject: any
  CustomerObject: any;
  LocationObject: any;
  errorMessage: any;
  IsDisabled: boolean = false;
  QuotationNumber: any;
  TradeinPartner: any;

  TradeinCategoryDDList:any[]=[];

  constructor(
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private activatedRoute: ActivatedRoute,
    private route: Router,


  ) { }

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    this.GetTradeinObject()
    this.onTradeinCategorySearch({ term: "", items: [] });
    this.OnTradeinPartnerSearch({ term: "", items: [] });
  }


  GetTradeinObject() {
    debugger
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetTradeinObject"
    });
    requestData.push({
      "Key": "TradeinGUID",
      "Value": this.params.TradeinGUID
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          debugger
          let data = JSON.parse(response.ExtraData);
          this.tradeinObject = data?.TradeinList?.Tradein
          this.LocationObject = data?.TradeinList?.Tradein?.LOCATION
          this.CustomerObject = data?.TradeinList?.Tradein?.CUSTOMER
          console.log('data?.TradeinList?.Tradein?.LOCATION', data?.TradeinList?.Tradein?.LOCATION)
          console.log('data?.TradeinList?.Tradein?.CUSTOMER', data?.TradeinList?.Tradein?.CUSTOMER)

          this.TradeinCategory = this.tradeinObject?.TransactionCategory ?? ''
          this.Remark = this.tradeinObject?.Remark ?? ''
          this.TransactionNo = this.tradeinObject?.TransactionNo ?? ''
          this.QuotationNumber =  this.tradeinObject?.QuotationNumber ?? ''
          this.TradeinPartner = this.tradeinObject?.TradeinPartner ?? ''

          if (this.tradeinObject?.TransactionCategory == 'CONVERTED') {
            this.IsDisabled = true;
          }
          else {
            this.IsDisabled = false;
          }


        }

        else {
          console.log("error");
          this.toaster.error('No records found')
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }




  onTradeinCategorySearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TRADEINCATEGORY, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          debugger
          this.TradeinCategoryDD = value;
          console.log("TradeinSubCategoryDD ", this.TradeinCategoryDD)

          this.TradeinCategoryDDList =  this.TradeinCategoryDD.Data.filter(item => item.Id !== 'AUTOCLOSE' )

        }
      },
      error: (err) => {
        this.TradeinCategoryDD = this.getBlankObject();
      }
    });
  }
  getBlankObject(): DropDownValue {
    throw new Error('Method not implemented.');
  }

  OnTradeinPartnerSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TRADEINPARTNER, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          debugger
          this.TradeinPartnerDD = value;
          console.log("TradeinSubCategoryDD ", this.TradeinPartnerDD)
        }
      },
      error: (err) => {
        this.TradeinPartnerDD = this.getBlankObject();
      }
    });
  }

  UpdateTradein() {

    if (this.TradeinCategory == '' || this.TradeinCategory == null || this.TradeinCategory == undefined) {
      this.toaster.error('Please Select Category to Proceed')
      return
    }
    if (this.TradeinCategory == 'OPEN') {
      this.toaster.error('Please Select Category other than  OPEN ')
      return
    }

    if (this.TradeinCategory == 'CONVERTED' && (this.TransactionNo == null || this.TransactionNo == undefined || this.TransactionNo?.trim() == '')) {
      this.toaster.error('Transaction No Cannot be empty...')
      return
    }

    debugger
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateTradein"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "TradeinGUID",
      "Value": this.params.TradeinGUID
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.Remark ?? ''
    });
    requestData.push({
      "Key": "TransactionNo",
      "Value": this.TransactionNo ?? ''
    });
    requestData.push({
      "Key": "TransactionCategory",
      "Value": this.TradeinCategory
    });
    requestData.push({
      "Key": "TradeinPartner",
      "Value": this.TradeinPartner ? this.TradeinPartner?.trim() : ''
    });
    requestData.push({
      "Key": "QuotationNumber",
      "Value": this.QuotationNumber ? this.QuotationNumber?.trim() : ''
    });

    console.log('requestData', requestData)
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        debugger
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.toaster.success("Saved Successfully");
          this.route.navigate(['/auth/' + glob.getCompanyCode() + '/tradein-list'])

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
        console.log("Error ", err)
      }
    });


  }


  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    this.toaster.error(error)
    console.log(error);
  }

}
