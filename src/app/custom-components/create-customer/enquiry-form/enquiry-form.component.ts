import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as glob from 'src/app/config/global';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { DropdownDataService,DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

@Component({
  selector: 'app-enquiry-form',
  templateUrl: './enquiry-form.component.html',
  styleUrls: ['./enquiry-form.component.css']
})
export class EnquiryFormComponent implements OnInit {
DispositionType: string = ''
Remark:string = ''
EnquiryGuid
DispositionList: any [] = []
ProductName: DropDownValue = this.getBlankObject();
EnquiryDispositionDD:DropDownValue = this.getBlankObject();

@Input() CustomerAllDetails
  errorMessage: any;
  productCategory: string = '';
  productIdData: string = ''
  serialNo: string = ''

  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private toast: ToastrService,
    private Location: Location,
    private ngxSpinnerService:NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.onProductName({ term: '', items: [] });
    
 this.onEnquiryDispsition({ term: '', items: [] });
    // this.DispositionList.push({
    //   "DispositionCode":"D1",
    //   "DispositionDescription":"Close With Sales Enquiry"
    // })
  }

  @Output() CloseEvent = new EventEmitter<any>(); 

  onSubmit() {

    if(this.serialNo == null || this.serialNo == undefined || this.serialNo == '')
    {
      this.toast.error("SerialNo Cannot be empty")
      return;
    }
    if(this.productIdData == null || this.productIdData == undefined || this.productIdData == '')
    {
      this.toast.error("Product Name Cannot be empty")
      return;
    }
    if(this.DispositionType == null || this.DispositionType == undefined || this.DispositionType == '')
    {
      this.toast.error("Please Select Disposition Type")
      return;
    }
    if(this.Remark == null || this.Remark == undefined || this.Remark == '')
    {
      this.toast.error("Remarks Cannot be empty")
      return;
    }
    this.EnquiryGuid = uuidv4()
      this.errorMessage = "";
      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveSalesEnquiry"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "EnquiryGUID",
        "Value": this.EnquiryGuid
      });
      requestData.push({
        "Key": "CustomerCode",
        "Value": this.CustomerAllDetails[0].CustomerCode
      });
      requestData.push({      
        "Key": "FirstName",
        "Value": this.CustomerAllDetails[0].FirstName
      });
      requestData.push({
        "Key": "LastName",
        "Value": this.CustomerAllDetails[0].LastName == null ||this.CustomerAllDetails[0].LastName == undefined?" ":this.CustomerAllDetails[0].LastName
      });
      requestData.push({
        "Key": "MobileNo",
        "Value": this.CustomerAllDetails[0].MobileNo
      });
      requestData.push({
        "Key": "EmailId",
        "Value": this.CustomerAllDetails[0].EmailID
      });
      requestData.push({
        "Key": "DispositionType",
        "Value": this.DispositionType
      });
      requestData.push({
        "Key": "Remark",
        "Value": this.Remark
      });
      requestData.push({
        "Key": "SerialNo",
        "Value": this.serialNo
      });
      requestData.push({
        "Key": "ProductId",
        "Value": this.productIdData
      });
       requestData.push({
        "Key": "ReferredBy",
        "Value": ''
      });
      requestData.push({
        "Key": "CustomerVisitSource",
        "Value": this.CustomerAllDetails[2].CustomerVisitSourceSelected == null || this.CustomerAllDetails[2].CustomerVisitSourceSelected == undefined ?'' : this.CustomerAllDetails[2].CustomerVisitSourceSelected
      });
       requestData.push({
        "Key": "CustomerSourceName",
        "Value": this.CustomerAllDetails[3].CustomerSourceNameSelected == null || this.CustomerAllDetails[3].CustomerSourceNameSelected == undefined ?'' : this.CustomerAllDetails[3].CustomerSourceNameSelected
      });
       requestData.push({
        "Key": "LocationCode",
        "Value": this.CustomerAllDetails[4].LocationCode ?? '' 
      });
       requestData.push({
        "Key": "TokenCode",
        "Value": this.CustomerAllDetails[5].TokenCode ?? '' 
      });
     
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log('requestData' , requestData)
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.toast.success("Enquiry Submitted Successfully")
              let Close  = false 
              this.CloseEvent.emit(Close)
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

    goBack()
    {
      this.Location.back()
    }
    
    onProductName($event: { term: String, items: any[] }) {
      console.log(this.productCategory)
      this.dropdownDataService.fetchDropDownData(DropDownType.ProductName, $event.term==undefined?"":$event.term, {
        ProductCategory: this.productCategory
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

    onEnquiryDispsition($event: { term: String, items: any[] }) { 
      this.dropdownDataService.fetchDropDownData(DropDownType.EnqDisposition, $event.term==undefined?"":$event.term, {
        
      }).subscribe({
        next: (value) => {
          if (value != null) { 
            this.EnquiryDispositionDD = value;
          }
        },
        error: (err) => {
          this.EnquiryDispositionDD = this.getBlankObject();
        }
      })
    }




    getBlankObject(): DropDownValue {
      const ddv = new DropDownValue();
      ddv.TotalRecord = 0;
      ddv.Data = [];
      return ddv;
    }
    
  }



