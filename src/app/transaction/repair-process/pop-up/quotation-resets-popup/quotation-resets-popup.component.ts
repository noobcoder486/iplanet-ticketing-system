import { Component, OnInit ,Input ,Output, EventEmitter } from '@angular/core';
import { CaseDetail } from '../../repair-process.metadata';

@Component({
  selector: 'app-quotation-resets-popup',
  templateUrl: './quotation-resets-popup.component.html',
  styleUrls: ['./quotation-resets-popup.component.sass']
})
export class QuotationResetsPopupComponent implements OnInit {
 
 
  @Output() closeQuotationResetsPopEvent = new EventEmitter<any>();
  @Input() repa: CaseDetail;

   isShowQuote:boolean=true;
   isShowQuoteParts:boolean=false;
   QuoteResetsList:any=[];
   QuoteResetsPartList:any=[];

  constructor() { }
  typeSelected = 'ball-clip-rotate';


  ngOnInit(): void {
    console.log('repa' , this.repa)
    this.QuoteResetsList =  Array.isArray(this.repa?.QuotationResetsList?.Data) ? this.repa?.QuotationResetsList?.Data : [this.repa?.QuotationResetsList?.Data];

    // this.QuoteResetsPartList = this.repa?.QuotationResetsList?.Data.flatMap(x => Array.isArray(x.Detail) ? x.Detail : [x.Detail]);
    this.QuoteResetsPartList = this.QuoteResetsList.flatMap(x => Array.isArray(x.Detail) ? x.Detail : [x.Detail]);


     console.log('from QuoteResetsList',this.QuoteResetsList)
     console.log('from QuoteResetsPartList',this.QuoteResetsPartList)

  }

  OncloseQuotationResetsPop(){
            this.closeQuotationResetsPopEvent.emit(false);  
  }
  

}
