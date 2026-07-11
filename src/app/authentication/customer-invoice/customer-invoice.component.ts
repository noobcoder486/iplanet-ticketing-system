import { Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-customer-invoice',
  templateUrl: './customer-invoice.component.html',
  styleUrls: ['./customer-invoice.component.css']
})
export class CustomerInvoiceComponent implements OnInit {
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  submitted = false;
  error = '';

  aproveVal = ""
  CustomerData
  status = ""
  QuoteData
  isQoutePop: boolean = true;
  TotalAllAmount: any = [];
  QuotePaymentDetails: any = [];
  QuoteList = [];
  CustomerDetails = []

  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getRepair_Api()
  }



  getRepair_Api() {
    var Guid = this.activatedRoute.snapshot.queryParams.guid
    this.dynamicService.getGuestQuoteData(Guid).subscribe(
      {
        next: (Value: any) => {
          let response = Value;
          if (response.ReturnCode == '0') {
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            let data = JSON.parse(response?.ExtraData);

            this.CustomerData = data.CUSTOMER
            this.QuoteData = data.QUOTE
            if (Array.isArray(data?.QUOTE?.QUOTEDETAILS?.QuoteItem)) {
              this.QuoteList = data?.QUOTE?.QUOTEDETAILS?.QuoteItem;

            }
            else {
              this.QuoteList.push(data?.QUOTE?.QUOTEDETAILS?.QuoteItem);
            }
            this.detail.next({ totalRecord: data?.Totalrecords, Data: this.QuoteList });
          }
        }
      })
  }

  Approval() {
    this.status = "APPROVED"
    this.update_quote()
  }

  Rejected() {
    this.status = "REJECTED"
    this.update_quote()

  }

  update_quote() {

    var Guid = this.activatedRoute.snapshot.queryParams.guid
    this.dynamicService.setGuestQuoteStatus(Guid, this.status).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
          }
          else {
            console.log("else")
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }


}


