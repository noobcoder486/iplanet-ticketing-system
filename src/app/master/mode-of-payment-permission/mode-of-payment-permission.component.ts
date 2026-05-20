import { Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from "src/app/config/global"
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import xml2js from 'xml2js';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-mode-of-payment-permission',
  templateUrl: './mode-of-payment-permission.component.html',
  styleUrls: ['./mode-of-payment-permission.component.css']
})
export class ModeOfPaymentPermissionComponent implements OnInit {

  isServiceManger:boolean=false;
  isLocalApprver:boolean=false;
 
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  Location: any ;
  ShowAddPopup:boolean=false;
   MOPList :any[] = [];
  ModeOfPayments =[

    { MOPCode : 'ADVANCE', MOPDesc:'Customer Advance' ,isAllowed:false },
    { MOPCode : 'CASH', MOPDesc:'Cash', isAllowed:false },
    { MOPCode : 'CHEQUE', MOPDesc:'Cheque/NEFT/RTGS', isAllowed:false },
    { MOPCode : 'CREDITCARD', MOPDesc:'Credit Card',isAllowed:false },
    { MOPCode : 'CREDITREQ', MOPDesc:'Credit Request',isAllowed:false },
    { MOPCode : 'INSTCASHBACK', MOPDesc:'Instant Cash Back',isAllowed:false },
    { MOPCode : 'PINELABS', MOPDesc:'PineLabs / Ecommerse',isAllowed:false },
    { MOPCode : 'STAFDEBIT', MOPDesc:'All Staff Debit',isAllowed:false },
    { MOPCode : 'UPI', MOPDesc:'UPI',isAllowed:false },
    { MOPCode : 'PAYTM', MOPDesc:'PAYTM',isAllowed:false },
    { MOPCode : 'MANUALPAYTM', MOPDesc:'Manual Paytm',isAllowed:false },
    { MOPCode : 'MANUALPINELABS', MOPDesc:'Manual Pinelabs',isAllowed:false },

     
  ]

 
 
  constructor( private dynamicService: DynamicService,
      private dropdownDataService: DropdownDataService,
      private toastMessage: ToastrService,
    ) { }

    

  ngOnInit(): void {
    this.checkLocalPermission()
    this.onLocationSearch({ term: "", item: [] });
    this.getModeOfPaymentPermissionFunc()
  }
   
  checkLocalPermission() {
    
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    if (resp?.View == true) {
      this.isLocalApprver=true;
    }

    let resp2 = allPermision.find(x => x.ProfileId == 8 || x.ProfileId == 7 || x.ProfileId == 8);
     if(resp2?.View == true){
      this.isServiceManger = true;
     }

    return resp != undefined && resp?.View ? true : false;
  }
   OnRadioChange(status , item){
      item.isAllowed = status
  }

  ToggleAddPopup(){
  
    this.ShowAddPopup = !this.ShowAddPopup;
    this.Location = '';

    this.ModeOfPayments = this.ModeOfPayments.map(mode => {
      return { 
        ...mode, 
        isAllowed: false
      };
    });
   
  }


  editPermission(item){
    
    this.Location = item.location;
    this.ShowAddPopup =!this.ShowAddPopup
    console.log('item before' , item)
     this.ModeOfPayments.map(mode => {
      const index = item.mops.findIndex(mop => mop.MOPCode === mode.MOPCode);
            console.log(index)
            
       let temp = item.mops[index].isAllowed == 1 ? true : false;
       mode.isAllowed=temp;

    });
     console.log()
     

  }

  Reset(){
    window.location.reload()
  }


   onLocationSearch($event: { term: string; item: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode:  glob.getCompanyCode().toString(),
      }).subscribe({
        next: (value) => {
          if (value != null) {
            this.LocationForJob = value;
          }
        },
        error: (err) => {
          this.LocationForJob = DropDownValue.getBlankObject();
        }
      });
    }

    getModeOfPaymentPermissionFunc(){
      
      let requestData = []
      requestData.push({
        "Key": "ApiType",
        "Value": "GetModeOfPaymentPermission"
      });
      requestData.push({
        "Key":"CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestData.push({
        "Key":"LocationCode",
        "Value":this.Location == null || this.Location == undefined ? '' : this.Location
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

              if(response.ReturnCode =='0'){
                let extraData = JSON.parse(response.ExtraData);
                this.MOPList = Array.isArray(extraData.MOPDetails.mop) 
                ? extraData.MOPDetails.mop 
                : [extraData.MOPDetails.mop];
                console.log('this.MOPList' , this.MOPList)
              }
              
            } catch (ext) {
             
              console.log(ext);
            }
          },
          error: err => {
            // this.ngxservice.hide()
            console.log(err);
          }
        }
      );
    }

    onSubmit(){

      if(this.Location == null || this.Location == undefined  || this.Location == '' ){
        this.toastMessage.error('Location Code CANNOT be empty!')
        return
      }
     
       let requestData = []
        requestData.push({
          "Key": "ApiType",
          "Value": "SaveModeOfPaymentPermission"
        });
           requestData.push({
             "Key":"LocationCode",
             "Value":this.Location
           })
           requestData.push({
             "Key":"CompanyCode",
             "Value": glob.getCompanyCode()
           })
           requestData.push({
             "Key":"MOPDetails",
             "Value": this.ConvertModeOfPaymentPermissionIntoXml()
           })
          
           let strRequestData = JSON.stringify(requestData);
           let contentRequest =
           {
             "content": strRequestData
           };

            const shouldContinue= confirm('Are you sure, you want to continue ? ')
            if(!shouldContinue){
              return
            }

           this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
                { 
                  next: (value) => {
                    
                    let response = JSON.parse(value.toString());
                    if (response.ReturnCode == '0') {

                        this.toastMessage.success('Data Saved Successfully !');
                        
                        this.ModeOfPayments = this.ModeOfPayments.map(mode => {
                          return { 
                            ...mode, 
                            isAllowed: false
                          };
                        });
   
                        window.location.reload();
                    }
                    else {
                      this.toastMessage.error("Error While Saving Mode of Payment permission")
                      console.log(response.ErrorMessage);
                      let errorMessage = response.ErrorMessage;
                       const parser = new xml2js.Parser({ strict: false, trim: true });
                       parser.parseString( errorMessage , (error, result) => {
                         const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                         errorMessages.forEach((errorMessage) => {
                           this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                         });
                       }); 
                       window.location.reload();
                    }
                  },
                  error: err => {
                    console.log(err);
                  }
                }); 

    }


     ConvertModeOfPaymentPermissionIntoXml(){
       let rawData = {
         "rows": []
       }
      
         for (let item of this.ModeOfPayments) {
           rawData.rows.push({
             "row": {
               "MOPCode": item.MOPCode,
               "MOPDesc": item.MOPDesc,
               "isAllowed": item.isAllowed
             }
           });
         }
       
     
       console.log("rawData", rawData);
       var builder = new xml2js.Builder();
       var xml = builder.buildObject(rawData);
       xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
       xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
       console.log("MOP Permission xml", xml);
       return xml;
     }



}
