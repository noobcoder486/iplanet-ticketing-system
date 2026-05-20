import { Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CaseDetail } from 'src/app/transaction/repair-process/repair-process.metadata';

@Component({
  selector: 'app-quote-approver',
  templateUrl: './quote-approver.component.html',
  styleUrls: ['./quote-approver.component.css']
})
export class QuoteApproverComponent implements OnInit {

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  submitted = false;
  error = '';
  
  aproveVal=""
  CustomerData
  QuoteData
  status=""
  repa: CaseDetail
  isQoutePop: boolean = true;
  TotalAllAmount:any=[];
  QuotePaymentDetails:any=[];
  QuoteList = [];
  CustomerDetails=[]
  CaseGUID: string

  constructor(
    private dynamicService: DynamicService,
    private activatedRoute:ActivatedRoute,
    private toaster : ToastrService
   ) { }

  ngOnInit(): void {
    this.CaseGUID = this.activatedRoute.snapshot.queryParams.guid
    console.log("caseGUID ", this.CaseGUID)
    this.getRepair_Api()
  }

  getRepair_Api() {
    this.dynamicService.getGuestJobData(this.CaseGUID).subscribe(
      {
        next: (response:any) => {
          
          console.log("My response:",response)
          if (response.ReturnCode == '0') {
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            let data = JSON.parse(response?.ExtraData);
            
            this.repa = data
            this.CustomerData = data.CUSTOMER
            this.QuoteData = data?.QUOTE
            if (this.QuoteData){
              if (Array.isArray(data?.QUOTE?.QUOTEDETAILS?.QuoteItem)) {
                this.QuoteList = data?.QUOTE?.QUOTEDETAILS?.QuoteItem;
              }
              else {
                this.QuoteList.push(data?.QUOTE?.QUOTEDETAILS?.QuoteItem);
              }
              console.log("Quotelist",this.QuoteList)
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.QuoteList });
            }
            else{
              this.toaster.error("Access Denied!")
            }

          }
        },
        error(err)  {
          console.log("My response:",err)
        },
      })
    }

    update_quote(){
       
      var Guid = this.activatedRoute.snapshot.queryParams.guid
      this.dynamicService.setGuestQuoteStatus(Guid,this.status).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if(response.ReturnCode == '0'){
            this.toaster.success("Quotation updated successfully!")
            window.location.reload()
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
