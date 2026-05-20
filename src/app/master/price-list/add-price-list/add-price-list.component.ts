import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-price-list',
  templateUrl: './add-price-list.component.html',
  styleUrls: ['./add-price-list.component.css']
})
export class AddPriceListComponent implements OnInit

 {
  effectiveDate: any;
  priceRangeApplicable: boolean;
  priceRangeStart: any;
  priceRangeEnd: any;
  marginType: any;
  margin: any;
  unitPrice: any;


  constructor(
    private formBuilder: FormBuilder,
    private route : Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService
  ) { }

  
  MaterialPriceGroup: String = ''
  LocationPriceGroup: String = ''
  PriceListGUID: String = ''
  CustomerPriceGroup: String = ''
  PricingOption: any = ''
  ProductCategory:String = ''
  EffectiveDate:String = ''
  PriceRangeApplicable:boolean=false;
  PriceRangeStart:any = ''
  PriceRangeEnd:any = ''
  MarginType:any = ''
  Margin:any = ''
  UnitPrice:any = ''
 CurrencyCode:any = ''
priceListGUID: any = ''
CompanyCodepricingOption: any = ''

  params:any;
  isEdit:boolean = false;
  formTitle: string = "Add"
  errorMessage: String;
  LocationPriceGroupDropDown: DropDownValue = this.getBlankObject();
  MaterialPriceGroupDropDown: DropDownValue = this.getBlankObject();
  CustomerPriceGroupDropDown: DropDownValue = this.getBlankObject();
  MarginTypeDropDown =[{Id: 'P' , TEXT: 'P'}]
  pricelist1:any;

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.formTitle = "Edit"
      this.isEdit = true
      this.getData()

    }
    this.onlocationPriceGroup({ term: "", items: [] });
    // this.onmaterialPriceGroup({ term: "", items: [] });
    this.onCustomerPriceGroup({ term: "", items: [] });
    // this.onMarginType({ term: "", items: [] });

    
  }

  slideval = false

  public newslide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }

  getData(){ 
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData= [];
requestData.push({
      "Key": "APIType",
      "Value": "GetPriceListObject"
    });

    requestData.push({
       "Key": "PriceListGUID",
        "Value":  this.params.nc
       });

       requestData.push({
        "Key": "CompanyCode",
         "Value":  glob.getCompanyCode()
        });

    let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next :(value) => {
            let response = JSON.parse(value.toString());
            
            
            if(response.ReturnCode =='0')
            {
              let data = JSON.parse(response.ExtraData);
              this.MaterialPriceGroup = data.PriceListDetails.MaterialPriceGroup;
              this.LocationPriceGroup = data.PriceListDetails.LocationPriceGroup;
              this.PriceListGUID = data.PriceListDetails.PriceListGUID;
              this.CustomerPriceGroup = data.PriceListDetails.CustomerPriceGroup;
              this.PricingOption = data.PriceListDetails.PricingOption;
              this.ProductCategory = data.PriceListDetails.ProductCategory;
              this.EffectiveDate = data.PriceListDetails.EffectiveDate;
              this.PriceRangeApplicable = data?.PriceListDetails?.PriceRangeApplicable  == '0' ? false : true
              this.PriceRangeStart = data.PriceListDetails.PriceRangeStart;
              this.PriceRangeEnd = data.PriceListDetails.PriceRangeEnd;
              this.MarginType = data.PriceListDetails.MarginType;
              this.Margin = data.PriceListDetails.Margin;
              this.UnitPrice = data.PriceListDetails.UnitPrice;
              this.CurrencyCode = data.PriceListDetails.CurrencyCode;
              this.priceListGUID = data.PriceListDetails.priceListGUID;
              
            }
            else{
              console.log("error");
              
            }
  
          },
          error :err =>{
            console.log(err);
          }
          });
  }

  returnPrevious()
  {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/price-list')
  }

  onSubmit() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SavePriceListMaster"
    });
    requestData.push({
      "Key": "PriceListGUID",
      "Value": this.params.nc == null || this.params.nc == undefined ? uuidv4() : this.params.nc
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationPriceGroup",
      "Value": this.LocationPriceGroup
    });
    requestData.push({
      "Key": "MaterialPriceGroup",
      "Value": this.MaterialPriceGroup
    });
    requestData.push({
      "Key": "CustomerPriceGroup",
      "Value": this.CustomerPriceGroup
    });
    requestData.push({
      "Key": "PricingOption",
      "Value": this.PricingOption
    })
    requestData.push({
      "Key": "ProductCategory",
      "Value": this.ProductCategory == null || this.ProductCategory == undefined ? "" : this.ProductCategory
    })
    requestData.push({
      "Key": "EffectiveDate",
      "Value": this.EffectiveDate
    })
    requestData.push({
      "Key": "PriceRangeApplicable",
      "Value": this.PriceRangeApplicable
    })
    requestData.push({
      "Key": "PriceRangeStart",
      "Value": this.PriceRangeStart
    })
    requestData.push({
      "Key": "PriceRangeEnd",
      "Value": this.PriceRangeEnd
    })
    requestData.push({
      "Key": "MarginType",
      "Value": this.MarginType
    })
    requestData.push({
      "Key": "Margin",
      "Value": this.Margin
    })
    requestData.push({
      "Key": "UnitPrice",
      "Value": this.UnitPrice
    })
    requestData.push({
      "Key": "CurrencyCode",
      "Value": this.CurrencyCode
    })
    console.log(" Array Data",requestData)


    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    }; 
    console.log("Array Data:",contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          console.log("VALUE",value)
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toastMessage.success("Form Submitted Successfully");
            this.returnPrevious()
          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });
          }

        },
        error: err => {
          if (err.includes('"message":"Cannot')) {
            // this.controlValidations()
          }
        }
      });
  }



  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
      
    console.log(errror)
  }


  onCustomerPriceGroup($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.PriceGroup, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.CustomerPriceGroupDropDown = value;
          }
        },
        error: (err) => {
          this.CustomerPriceGroupDropDown = this.getBlankObject();
        },
      });
  }
  // onMarginType($event: { term: ""; items: [] }) {
  //   this.dropdownDataService
  //     .fetchDropDownData(DropDownType.MarginType, $event.term)
  //     .subscribe({
  //       next: (value) => {
  //         if (value != null) {
  //           this.MarginTypeDropDown = value;
  //         }
  //       },
  //       error: (err) => {
  //         this.MarginTypeDropDown = this.getBlankObject();
  //       },
  //     });
  // }

  // onmaterialPriceGroup($event: { term: ""; items: [] }) {
  //   this.dropdownDataService
  //     .fetchDropDownData(DropDownType.MaterialPriceGroup, $event.term)
  //     .subscribe({
  //       next: (value) => {
  //         if (value != null) {
  //           this.MaterialPriceGroupDropDown = value;
  //         }
  //       },
  //       error: (err) => {
  //         this.MaterialPriceGroupDropDown = this.getBlankObject();
  //       },
  //     });
  // }

  onlocationPriceGroup($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.LocationPriceGroup, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.LocationPriceGroupDropDown = value;
          }
        },
        error: (err) => {
          this.LocationPriceGroupDropDown = this.getBlankObject();
        },
      });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
