import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';
import { CaseDetail,type } from '../../repair-process.metadata';
import * as glob from 'src/app/config/global';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';

@Component({
  selector: 'app-company-stock-popup',
  templateUrl: './company-stock-popup.component.html',
  styleUrls: ['./company-stock-popup.component.sass']
})
export class CompanyStockPopupComponent implements OnInit {



    @Output() closeCompanyStockPopupEvent = new EventEmitter<any>();
    @Output() closeReplenishPopupEvent = new EventEmitter<any>();

    @Input() repa: CaseDetail;
    @Input() type: type;

    
    typeSelected ='ball-clip-rotate';

    MaterialCode:any
    CompanyStockList:any=[];
    SelectedCompanyStockList:any=[];

    
  constructor(
        private dynamicService: DynamicService,
    
  ) { }

  ngOnInit(): void {
    console.log('repa from CompanyStockPopupComponent' , this.repa)
    this.GetCompanyStockList()
  }


  GetCompanyStockList() {
    
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCompanyStockList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode().toString()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.repa?.LOCATION?.LocationCode
      

    });
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.MaterialCode
    });
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log('GetCompanyStockList requeset date', contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.CompanyStockList = []
              if (Array.isArray(data?.CompanyStockList?.CompanyStock)) {
                this.CompanyStockList = data?.CompanyStockList?.CompanyStock
              }
              else {
                this.CompanyStockList.push(data?.CompanyStockList?.CompanyStock)
              }

              this.CompanyStockList.forEach(item=>
              {
                item.IsSelected = false;
                item.IsDeleted = "0"
              }

              )
            
              console.log(' from company stock popup', this.CompanyStockList)
            }
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

  onSubmit(){
    
     this.SelectedCompanyStockList=[];

     this.CompanyStockList.forEach(item => {
        if(item.IsSelected == true){
           this.SelectedCompanyStockList.push(item);
        }
     })

    console.log('SelectedCompanyStockList' , this.SelectedCompanyStockList)
    console.log('CompanyStockList' , this.CompanyStockList)

       if(this.type?.type == "STOCK"){
        this.closeCompanyStockPopupEvent.emit(this.SelectedCompanyStockList);   
       }

       if(this.type?.type == "REPLENISH" ){
        this.closeReplenishPopupEvent.emit(this.SelectedCompanyStockList);   
       }


  }


}
