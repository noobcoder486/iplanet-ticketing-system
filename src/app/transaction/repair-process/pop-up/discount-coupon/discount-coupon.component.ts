import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output,Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from 'src/app/config/global'
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';



@Component({
  selector: 'app-discount-coupon',
  templateUrl: './discount-coupon.component.html',
  styleUrls: ['./discount-coupon.component.css']
})
export class DiscountCouponComponent implements OnInit {

  @Input() discountObjToPopUp:any;
  popUpArray: any[] = [];
  typeSelected = 'ball-clip-rotate';
  hideDiscountPopup: boolean = false;
  showToolTip:boolean = false;
  // discountTypeRequested:string = '';
  discountType:any[] = ['ADD','DEDUCT']
  discountAmountRequested:number = 0;

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toasty: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
  ) { }

  @Output() CancelBtn = new EventEmitter<any>();
  @Output() applyDiscount = new EventEmitter<any>();

    DiscountTypeSearchDD: DropDownValue = DropDownValue.getBlankObject();
    DiscountType:any;

    
  AutoApproveDiscountDetailsList: any[] = [];
  PartTypeApplicableForAutoApprove:any[]=[];
  IsAutoDiscountApplicable:boolean=false;
  Discount_Add_Amount:any;

  

  
  ngOnInit(): void {
    this.getDiscount4Customer()
    this.onDiscountTypeSearch({ term: "", items: [] });

  }

  hideAddDiscount(){
    this.hideDiscountPopup = !this.hideDiscountPopup;
  }

  addDiscount(item)
  {
    
    if ( item.CouponCode ==  this.discountObjToPopUp.DiscountCouponCode ){
      this.toasty.error("Discount already applied")
    }
    else{
      this.applyDiscount.emit(item)
    }
    this.hideAddParts()
  }


  getDiscount4Customer()
  {
    this.GetAutoApproveDiscountDetails()


    this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key":"APIType",
      "Value":"GetDiscount4Customer"
    })
    requestData.push({
      "Key":"CustomerCode",
      "Value":this.discountObjToPopUp?.CustomerCode
    })
    requestData.push({
      "Key":"MaterialCode",
      "Value":this.discountObjToPopUp?.MaterialCode
    })
    requestData.push({
      "Key":"DiscountCouponStatus",
      "Value":"SENT FOR APPROVAL"
    })
    requestData.push({
      "Key":"LocationCode",
      "Value":this.discountObjToPopUp?.LocationCode
    })
    requestData.push({
      "Key":"CaseGUID",
      "Value":this.discountObjToPopUp?.CaseGUID
    })
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData)
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
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toasty.error("No Discount Available")
              }
              else {
                if (Array.isArray(data?.DiscountCouponList?.DiscountCoupon)) {
                  this.popUpArray = data?.DiscountCouponList?.DiscountCoupon
                }
                else {
                  this.popUpArray.push(data?.DiscountCouponList?.DiscountCoupon)
                }
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

  saveDiscount()
  {
     

    if(this.discountObjToPopUp.MaterialCode == null || this.discountObjToPopUp.MaterialCode == undefined || this.discountObjToPopUp.MaterialCode == '')
    {
      this.toasty.error("Material Code not found for discount")
      return
    }
    if(this.discountObjToPopUp.UnitPrice == null || this.discountObjToPopUp.UnitPrice == undefined || this.discountObjToPopUp.UnitPrice == 0)
    {
      this.toasty.error("Material Unit Price not found for discount")
      return
    }
    if(this.discountAmountRequested == null || this.discountAmountRequested == undefined || this.discountAmountRequested < 1)
    {
      this.toasty.error("Invalid Discount Amount!")
      return
    }
    if(this.discountAmountRequested > this.discountObjToPopUp.UnitPrice)
    {
      this.toasty.error("Discount Amount cannot be greater than Unit Price")
      return
    }

     if (this.DiscountType == null   || this.DiscountType  == undefined ||  this.DiscountType  == '') {
      this.toasty.error("Discount Type not found for discount")
      return
    }


    
    this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key":"APIType",
      "Value":"SaveDiscount"
    })
    requestData.push({
      "Key":"CustomerCode",
      "Value":this.discountObjToPopUp.CustomerCode
    })
    requestData.push({
      "Key":"MaterialCode",
      "Value":this.discountObjToPopUp.MaterialCode
    })
    requestData.push({
      "Key":"LocationCode",
      "Value":this.discountObjToPopUp.LocationCode
    })
    requestData.push({
      "Key":"CaseGUID",
      "Value":this.discountObjToPopUp.CaseGUID
    })
    requestData.push({
      "Key":"CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key":"DiscountGUID",
      "Value": uuidv4()
    })
    requestData.push({
      "Key":"IsConsumed",
      "Value": "0"
    })
    requestData.push({
      "Key":"UnitPrice",
      "Value": this.discountObjToPopUp.UnitPrice
    })
    requestData.push({
      "Key":"DiscountAmount",
      "Value": this.discountAmountRequested
    })
    requestData.push({
      "Key":"CouponCode",
      "Value": ''
    })
    requestData.push({
      "Key":"DiscountCouponStatus",
      "Value": 'SENT FOR APPROVAL'
    })
    requestData.push({
      "Key":"IsInvoiceConsumed",
      "Value": '0'
    })
    requestData.push({
      "Key":"IsQuoteConsumed",
      "Value": '0'
    })

    requestData.push({
      "Key": "DiscountType",
      "Value":  this.DiscountType
    })
   
    requestData.push({
      "Key": "IsAutoApprove",
      "Value":  (this.discountAmountRequested <= this.Discount_Add_Amount && this.IsAutoDiscountApplicable == true ) ? 1 : 0
    })
    
    // requestData.push({
    //   "Key": "DiscountType",
    //   "Value": this.discountTypeRequested == ''?"ADD":this.discountTypeRequested
    // })

    console.log('requestData', requestData)

    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          ''
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toasty.error("Discount Request Failed")
              }
              else {
                this.toasty.success("Discount Requested Submitted Successfully")
                this.hideDiscountPopup = true
                this.hideAddParts()
              }
            }
            else {
              
              let errorMessage = response.ErrorMessage;
               const parser = new xml2js.Parser({ strict: false, trim: true });
               parser.parseString( errorMessage , (error, result) => {
                 const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                 errorMessages.forEach((errorMessage) => {
                   this.toasty.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                 });
               }); 
            }
          }
          catch (ext) {
              
              console.log("Error ", ext)
              this.toasty.error(ext, "Error:-", { closeButton: true, disableTimeOut: true });
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }
      }
    ); 
  }

  hideAddParts()
  { 
    this.CancelBtn.emit(false)  
  }


   onDiscountTypeSearch($event: { term: string; items: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.DISCOUNTTYPE, $event.term).subscribe({
        next: (value) => {
          if (value != null) {
            
            this.DiscountTypeSearchDD = value;
            console.log("DiscountTypeSearchDD ", this.DiscountTypeSearchDD)
          }
        },
        error: (err) => {
          this.DiscountTypeSearchDD = this.getBlankObject();
        }
      });
    }

    

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }




    GetAutoApproveDiscountDetails() {
       
       let requestData = []
       requestData.push({
         "Key": "APIType",
         "Value": "GetAutoApproveDiscountDetails"
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
                 
                 if (Array.isArray(data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails)) {
                   this.AutoApproveDiscountDetailsList = data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails
                 }
                 else {
                   this.AutoApproveDiscountDetailsList.push(data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails)
                 }
                
                  this.AutoApproveDiscountDetailsList.forEach(x =>{
                      this.PartTypeApplicableForAutoApprove.push(x.PartType)
                  })

                  
   
                  console.log('this.PartTypeApplicableForAutoApprove' , this.PartTypeApplicableForAutoApprove)

                  this.PartTypeApplicableForAutoApprove =  this.PartTypeApplicableForAutoApprove.map(x => x?.toLowerCase());

                  this.IsApplicable4AutoDiscountApprove()
                 
               }
               console.log('this.AutoApproveDiscountDetailsList', this.AutoApproveDiscountDetailsList)
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
   
     IsApplicable4AutoDiscountApprove(){ 

         const safeRound = (value) => isNaN(value) ? 0 : Math.round(value * 100) / 100;
         
        if(this.PartTypeApplicableForAutoApprove.includes( this.discountObjToPopUp?.PartType?.toLowerCase()) ){
         this.IsAutoDiscountApplicable=true;
          const PartTypeApplicableForAutoDisc = this.AutoApproveDiscountDetailsList.find(a => a.PartType?.toLowerCase() == this.discountObjToPopUp?.PartType?.toLowerCase() )
          this.Discount_Add_Amount = safeRound(((PartTypeApplicableForAutoDisc?.DiscountPercentage)/100) * this.discountObjToPopUp.UnitPrice)
        }
        else{
         this.IsAutoDiscountApplicable=false;
        }
     }
   
  


}
