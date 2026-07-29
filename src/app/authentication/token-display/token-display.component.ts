import { Component, OnInit,Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from "src/app/config/global";

@Component({
  selector: 'app-token-display',
  templateUrl: './token-display.component.html',
  styleUrls: ['./token-display.component.sass']
})
export class TokenDisplayComponent implements OnInit {

  constructor(
    private dynamicService: DynamicService,
    private route: Router,    
    private activatedRoute: ActivatedRoute,
  ) { }
  

ServingArray:any=[];
ServingArrayFinal:any=[];
QueueArray:any=[]
QueueArrayFinal:any=[]
RemoveArray: any = []
  ngOnInit(): void {
    this.loadPageData()
  }



  loadPageData(){
    setTimeout(() => {
      this.loadPageData();
      
    }, 5000);
    let param = this.activatedRoute.snapshot.queryParams;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetTokenList4Location"
        });
        requestData.push({
          "Key":"LocationCode",
          "Value": param.cc
        });
            requestData.push({
         "Key": "CompanyCode",
         "Value": glob.getCompanyCode()
        });


        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content" : strRequestData
        };
        //
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
                    console.log(results)
                  }
                  else
                  {
                    results.push(data?.Token)
                  }
                  this.QueueArray = []
                  this.ServingArray = []
                  for(let itemdata of results){
                    console.log(itemdata,"Data")
                    if(itemdata.TokenStatus == "IN-QUEUE" )
                    {
                      this.QueueArray.push(itemdata);
                    }else if(itemdata.TokenStatus == "SERVING"){
                      this.ServingArray.push(itemdata)
                    }else if(itemdata.TokenStatus == "SERVING" || itemdata.TokenStatus == "IN-QUEUE"){
                      this.RemoveArray.push(itemdata)
                    }
                    
                  }
                  this.timeCalulator()
                  this.DateQueueCalculate()
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

    function(){
      console.log("Data" , this.QueueArray[0].CreatedDate)
    }
    difference
timeCalulator(){
  this.ServingArrayFinal = []

//  
setTimeout(() => {
  this.timeCalulator();
  
}, 1000);
  for(let i of this.ServingArray){
    const startTime = new Date(i.TokenDate);
    const endTime = new Date();
    endTime.setHours(endTime.getHours());
    this.difference = endTime.getTime() - startTime.getTime();
    let  min = Math.floor((this.difference/1000/60) << 0)    
    var ms = this.difference;
    var d = new Date(1000*Math.round(ms/1000)); // round to nearest second
    function pad(i) { return ('0'+i).slice(-2); }
    var WaitingTime = d.getUTCHours() + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
    //console.log(WaitingTime); 
    //  

    this.ServingArrayFinal.push({
      "Counter":i.Counter,
      "EmailId":i.Warranty,
      "FirstName":i.FirstName,
      "LastName":i.LastName,
      "MobileNo":i.MobileNo,
      "TokenCode":i.TokenCode,
      "TokenDate":i.TokenDate,
      "TokenStatus":i.TokenStatus,
      "VisitPurpose":i.VisitPurpose,
      "VisitPurposeDesc":i.VisitPurposeDesc,
      "WaitingTime": WaitingTime,
    })
  }
  
 
}


secondsToHMS(secs) {
  function z(n){return (n<10?'0':'') + n;}
  var sign = secs < 0? '-':'';
  secs = Math.abs(secs);
  return sign == '-' ? "00:00:00":sign + z(secs/3600 |0) + ':' + z((secs%3600) / 60 |0) + ':' + z(secs%60);
}

DateQueueCalculate(){
  this.QueueArrayFinal = []
  setTimeout(() => {
    this.DateQueueCalculate();
    
  }, 1000);
  for(let i of this.QueueArray){
    //  
    var startTime = new Date(i.TokenDate);
    var endTime = new Date()
    //var diffMilliSeconds = endTime - startTime
    //endTime.setHours(endTime.getHours());
    this.difference = endTime.getTime() - startTime.getTime();
    var timetodisplay =  this.secondsToHMS(this.difference/1000).substring(1,8)

    /*let  min = Math.floor((this.difference/1000/60) << 0)    
    var ms = this.difference;
    var d = new Date(1000*Math.round(ms/1000)); // round to nearest second
    function pad(i) { return ('0'+i).slice(0); }
    var WaitingTimeQueue = d.getUTCHours() + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());*/

    this.QueueArrayFinal.push({
      "Counter":i.Counter,
      "EmailId":i.Warranty,
      "FirstName":i.FirstName,
      "LastName":i.LastName,
      "MobileNo":i.MobileNo,
      "TokenCode":i.TokenCode,
      "TokenDate":i.TokenDate,
      "TokenStatus":i.TokenStatus,
      "VisitPurpose":i.VisitPurpose,
      "VisitPurposeDesc":i.VisitPurposeDesc,
      "WaitingTime": timetodisplay //WaitingTimeQueue,
    })
  }
}
}
