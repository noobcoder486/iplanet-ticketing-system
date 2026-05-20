import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as glob from "../../../config/global";


@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  showOnlySelected= false
  totalAmount = 0;
  selectedItemList: any[] = []
  // Send the Item list to Refund Order
  @Output() FinalItemList= new EventEmitter<any>();

  // Recieve all these Values
  @Input() LocationCode : string;
  @Input() CustomerCode : string;
  @Input() guid : string;

  @Input() docType : String;
  @Input() recieveItemList: any[] = []
  @Output() CloseEmit = new EventEmitter<any>();
  // Search Fields
  PaymentDate: string;
  PaymentAmount: string;
  GLCode: string;
  close: boolean;


  // Result from the DB:-
  resultList: any[] =[];
  
  constructor(
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toastService: ToastrService,

  ) { }

  ngOnInit() {
    this.GetItemList('','','')
  }

  GetItemList( paymentDate, paymentAmount, glcode){
    //  
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value": "GetRefundRequestPaymentObject"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value":this.LocationCode
    })
    requestdata.push({
      "Key":"RetailCustomerCode",
      "Value": this.CustomerCode
    })
    requestdata.push({
      "Key": this.docType == 'RREFUND' ? "CaseGUID" : "InvoiceHeaderGUID", // If its Repair then send the CaseGUID else InvoiceGUID
      "Value": this.guid
    })
    requestdata.push({
      "Key": "RefundDocType",
      "Value": this.docType
    })
    console.log("Before Payment List to  DB:-", requestdata)
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("Data is ", data)
              if (data.Totalrecords == "0"){
                this.toastService.error("No Payment Data Found")
                return
              }
              if( Array.isArray(data?.PaymentList?.PaymentRow) ) 
              {
                this.resultList = data.PaymentList?.PaymentRow;
              }
              else{
                this.resultList.push(data.PaymentList.PaymentRow)
              }

              // Remove the Paymnets rows if already present in the Refund Order's List
              console.log("Recieved Payment List", this.recieveItemList)
              this.resultList= this.resultList.filter ((paymentrow, index)=>{
                const paymentExits = this.recieveItemList.some((recievePayment)=>{
                  return recievePayment.PaymentGUID == paymentrow.PaymentGUID
                });
                if (!paymentExits ){
                  paymentrow.index = index + 1;
                }
                return !paymentExits
              })
              // this.toastService.warning("No Payments Left to be Selected")
              console.log("Refund Rows are:- ",this.resultList)
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

  showItem(item): Boolean{
    if(this.showOnlySelected == false){
      if(item.selected == true){
        return true
      }
      else{
        return false
      }
    }
    else{
      if(item.selected == true){
        return true
      }
      else{
        return false
      }
    }
  }

  UpdateSelectedCount(item){
    // this.selectedItemList = this.PaymentList.filter( payment => payment.selected == true ).length
    if(item.selected ){
      this.selectedItemList.push(item);
    }
    else{
      let index = this.selectedItemList.indexOf(item)
      this.selectedItemList.splice(index,1)
    }
    this.TotalNetAmount()
  }

  TotalNetAmount(){
    this.totalAmount = 0
    this.totalAmount = this.selectedItemList.reduce(
      (acc, item) => acc + parseFloat(item.Amount),
      0
      );
  }

  search(){
    this.GetItemList(this.PaymentDate, this.PaymentAmount, this.GLCode)
  }
  
  onSubmit(){
    if(this.selectedItemList.length> 0){
      this.FinalItemList.emit(this.selectedItemList)
    }
    else{
      this.toastService.error("No Payment Selected")
    }
  }


  closeBtn()
  {
    this.close = false; 
    this.CloseEmit.emit(false) 
  }
}

