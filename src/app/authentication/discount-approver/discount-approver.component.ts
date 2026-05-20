import { Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-discount-approver',
  templateUrl: './discount-approver.component.html',
  styleUrls: ['./discount-approver.component.css']
})
export class DiscountApproverComponent implements OnInit {

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  submitted = false;
  error = '';
  
  aproveVal=""
  CustomerData
  QuoteData
  status=""
  isQoutePop: boolean = true;
  TotalAllAmount:any=[];
  QuotePaymentDetails:any=[];
   QuoteList = [];
   CustomerDetails=[]

  constructor(
    private dynamicService: DynamicService,
    private activatedRoute:ActivatedRoute,
   ) { }

  ngOnInit(): void {
    this.getRepair_Api()
    console.log("Detals:",this.detail)
    }

  getRepair_Api() {
    console.log(this.activatedRoute.snapshot.queryParams.guid,"Data")
    var Guid = this.activatedRoute.snapshot.queryParams.guid
    this.dynamicService.getGuestQuoteData(Guid).subscribe(
      {
        next: (Value:any) => {
          console.log("Values:",Value)
        let response=Value;
        console.log("My response:",response)
          if (response.ReturnCode == '0') {
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            console.log("My response23:",response);
            let data = JSON.parse(response?.ExtraData);
            
            this.CustomerData = data.CUSTOMER
            this.QuoteData = data.QUOTE
            console.log("DATA:",data);           
              if (Array.isArray(data?.QUOTE?.QUOTEDETAILS?.QuoteItem)) {
                this.QuoteList = data?.QUOTE?.QUOTEDETAILS?.QuoteItem;
                
                console.log("Quotelist",this.QuoteList)
              }
              else {
                this.QuoteList.push(data?.QUOTE?.QUOTEDETAILS?.QuoteItem);
                    }
                    console.log("Woutede",this.QuoteList)
                 this.detail.next({ totalRecord: data?.Totalrecords, Data: this.QuoteList });
          }
        }
      })
    }

    DiscountApproval(){
      this.status = "DISCOUNTAPPROVED"
      this.update_quote()
    }

    DiscountRejected(){
      this.status = "DISCOUNTREJECTED"
      this.update_quote()

    }

    update_quote(){
       
      var Guid = this.activatedRoute.snapshot.queryParams.guid
      this.dynamicService.setGuestQuoteStatus(Guid,this.status).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if(response.ReturnCode == '0'){
            }
            else{
              console.log("else")
            }
          },
          error: err => {
            console.log(err);
          }
        });
      }  

}
