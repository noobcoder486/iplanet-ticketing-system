import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from 'xml2js';
import * as glob from 'src/app/config/global';


@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.sass']
})
export class AddProductComponent implements OnInit {

  productDescription
  productCategory
  OSType
  ProductType: any[] = [  'IPHONE',   'MAC' , 'AIRPOD', 'IMAC', 'IPAD', 'ACCESSORIES' , 'WATCH']
  osType: any[] = [  'IOS',   'MAC OS' ]
  @Input() StoreAllResponse
  errorMessage: any;


  ngOnChanges(changes: SimpleChanges): void{
    if(changes['StoreAllResponse']){
      if(this.StoreAllResponse != null || this.StoreAllResponse != undefined){
        this.productDescription = this.StoreAllResponse.device.productDescription
        console.log("Data" , this.StoreAllResponse.device.productDescription)
      }
    }
  }

  constructor(
    private dynamicService : DynamicService
  ) { }

  ngOnInit(): void {
  }


  onSubmit() {
    
    let requestData = [];

      requestData.push({
        "Key": "ApiType",
        "Value": "SaveProductData"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "ProductName",
        "Value": this.productDescription
      });
      
      requestData.push({
        "Key": "ProductCategory",
        "Value": this.productCategory
      });
      requestData.push({
        "Key": "OSType",
        "Value": this.OSType
      });
      
      ;
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        "content": strRequestData
      };
      ;
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
 
            let response = JSON.parse(value.toString());

            if (response.ReturnCode == '0') {
              console.log("sucess");
              
              
            }
            else {

              this.errorMessage = response.ReturnMessage;

              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;

              });
            }
          },
          error: err => {
            console.log(err);
          }
        });
    } 

}