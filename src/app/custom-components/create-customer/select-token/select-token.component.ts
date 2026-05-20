import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';

@Component({
  selector: 'app-select-token',
  templateUrl: './select-token.component.html',
  styleUrls: ['./select-token.component.css']
})
export class SelectTokenComponent implements OnInit {

  @Output() TokenObj = new EventEmitter<any>(); 
  @Output() CloseEvent = new EventEmitter<any>(); 

   QueueArray: any = []
   @Input() LocationCode;

  constructor(
    private dynamicService: DynamicService
  ) { }

  ngOnInit(): void {
    this.loadPageData()
  }

  loadPageData(){
        let requestData =[];
        requestData.push({
          "Key":"APIType",
          "Value": "GetTokenList4Location"
        });
        requestData.push({
          "Key":"LocationCode",
          "Value": this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
        });

        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content" : strRequestData
        };
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next : (Value) =>
            {
              try{
                let response = JSON.parse(Value.toString());
                if(response.ReturnCode =='0')
                {
                  let data = JSON.parse(response?.ExtraData);
                  let results = []
                  if(Array.isArray(data?.Token))
                  {
                    results = data?.Token
                  }
                  else
                  {
                    results.push(data?.Token)
                  }
                  for(let itemdata of results){
                    if(itemdata.TokenStatus == "IN-QUEUE" || itemdata.TokenStatus == "HOLD" )
                    {
                      this.QueueArray.push(itemdata);
                    }
                  }
                  
                }
              }catch(ext){
                console.log(ext);
              }
            },
            error : err =>
            {
              console.log(err);
            }
          }
        );
    }  

    selectedToken(item){
      var close = false
      this.TokenObj.emit(item)
      this.CloseEvent.emit(close)
    }

}
