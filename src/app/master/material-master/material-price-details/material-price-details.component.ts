import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { GsxService } from "src/app/common/Services/gsxService/gsx.service";
import { NgxSpinnerService } from 'ngx-spinner';



@Component({
  selector: 'app-material-price-details',
  templateUrl: './material-price-details.component.html',
  styleUrls: ['./material-price-details.component.sass']
})
export class MaterialPriceDetailsComponent implements OnInit {
  MaterialCode: string
  MaterialName: string
  StockPrice: string
  ExchangePrice: string
  ERPMaterialCode: string
  PriceGroup: string
  PartType: string
  ItemType: string
  MaterialObject: any
  PriceListDetailsList: any[] = []
  FinalPriceListDetailsList: any[] = []

  IsShowTable: boolean = false;

  TaxType: DropDownValue = this.getBlankObject();
  GSTGroupCode: DropDownValue = this.getBlankObject();
  ItemCodeDD: DropDownValue = this.getBlankObject();
  ItemTypeDD: any[] = [
    { "Id": "Material", "TEXT": "Material" },
    { "Id": "Resource", "TEXT": "Resource" }
  ]



  typeSelected = 'ball-clip-rotate';



  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private gsxService: GsxService,
    private ngxSpinnerService: NgxSpinnerService,


  ) { }
  Serialized = "";
  formTitle: string = "Add"
  isEdit: boolean = false;
  MyFunction_T() {
    this.Serialized;

    let tgl = this.Serialized;
    if (tgl == "") {
      console.log(1)
    }
    else {
      console.log(0)

    }

  }
  params: any;
  materialForm: FormGroup;
  materialCode: string;
  CompanyCode: string
  // material: Material;
  errorMessage: String;
  // PartType: DropDownValue = this.getBlankObject();
  // PriceGroup: DropDownValue = this.getBlankObject();
  MaterialDD: DropDownValue = this.getBlankObject();

  PriceSource: any

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    // this.material = new Material();
    // this.material.materialForm = this.materialForm;

    // this.onPartType({ term: '', items: [] })
    // this.onPriceGroup({term:'', items:[]})
    this.onMaterial({ term: '', items: [] })
  }

  slideval = false

  public newslide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }

  search() {
    if (this.materialCode == null || this.materialCode == undefined) {
      this.toastMessage.error("Please enter a material code!")
    }
    else {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/material-price-details'], { queryParams: { cc: this.CompanyCode, nc: this.materialCode } })
    }
  }

  getData() {
    this.PriceSource = ''

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetMaterialPriceDetailObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.params.nc == null || this.params.nc == undefined ? '' : this.params.nc
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Response ", requestData)
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            console.log("Response ", data)
            this.MaterialObject = data
            this.MaterialCode = data.MaterialCode,
              this.MaterialName = data.MaterialName,
              this.StockPrice = data.MaterialName,
              this.ExchangePrice = data.MaterialDescription,
              this.ERPMaterialCode = data.ERPMaterialCode,
              this.PriceGroup = data.PriceGroup
            this.PartType = data.PartType
            this.ItemType = data.ItemType
            this.PriceSource = data?.PriceSource ?? ''
            console.log('this.PriceSource', this.PriceSource)
            if (Array.isArray(data?.PriceDetailsObject?.PriceDetails)) {
              this.PriceListDetailsList = data?.PriceDetailsObject?.PriceDetails,
                this.FinalPriceListDetailsList = data?.PriceDetailsObject?.PriceDetails

            }
            else {
              this.PriceListDetailsList.push(data?.PriceDetailsObject?.PriceDetails),
                this.FinalPriceListDetailsList.push(data?.PriceDetailsObject?.PriceDetails)

            }

            if (this.PriceListDetailsList.length < 1) {
              this.toastMessage.info("No Price List Information Available!")
            }
            else {

              this.PriceListDetailsList.forEach(item => {
                item.GSTPercentage = 18
                item.TaxableAmount = item.UnitPrice
                item.TaxAmount = item.UnitPrice
                item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
                item.TaxAmount = item.GSTAmount
                item.NetAmount = parseFloat(item.TaxableAmount) + parseFloat(item.TaxAmount)

                // item.CGSTPercentage = object.CGSTPercentage
                // item.SGSTPercentage = object.SGSTPercentage
                // item.IGSTPercentage = object.IGSTPercentage
                // item.MarginPercentage = 0; //parseFloat(object.Margin)
                // item.MarginAmount = 0; // (parseFloat(object.StockPrice) / ( 1 - (object.Margin / 100)))-parseFloat(object.StockPrice)
                // item.SAC_HSNCode = object.SAC_HSNCode
                // item.DiscountAmount = 0.00
                // item.UnitPrice = object.UnitPrice == undefined || object.UnitPrice == null ? 0 : object.UnitPrice;
                // item.MinimumUnitPrice = object?.UnitPrice == undefined || object?.UnitPrice == null ? 0 : object?.UnitPrice;
                // item.BaseAmount = parseFloat(item.UnitPrice) * item.Quantity
                // item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
                // item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
                // item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
                // item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
              })



              this.Get_MaterialPriceObject();


            }
          }
          else {
            this.toastMessage.error("No records found")
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }






  onMaterial($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.MaterialItemCode, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MaterialDD = value;
          console.log(this.MaterialDD)
        }
      },
      error: (err) => {
        this.MaterialDD = this.getBlankObject();
      }
    });
  }

  controlValidations() {
    Object.keys(this.materialForm.controls).forEach(field => {
      let controlValue = this.materialForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.materialForm.get(field).setErrors({ incorrect: true })
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  returnPrevious() {
    this.route.navigateByUrl('/auth/' + glob.getCompanyCode() + '/material-master')
  }
  getErrorMessage(control: string): string {
    let formControl = this.materialForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
    var validationErrorMessage = errror[0]
    console.log(validationErrorMessage)
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  getAccessoryMarginListXml() {
    let rawData = {
      "rows": []
    }

    for (let item of this.PriceListDetailsList) {
      rawData.rows.push({
        "row": {
          "ItemCode": item.MaterialPriceGroup,
          "UnitPrice": this.dynamicService.removeCommas(item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString()),
          "PricingOptions": item.PricingOption == null || item.PricingOption == undefined ? '' : item.PricingOption,
          "PriceSource": item.PriceSource == null || item.PriceSource == undefined ? '' : item.PriceSource,
          "GSTPercentage": item.GSTPercentage

        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
    console.log('xml', xml)
    return xml;
  }




  async Get_MaterialPriceObject() {
    
    this.IsShowTable = false;

    if (this.PriceSource == 'GSX' || this.PriceGroup === 'GSX') {
      console.log('GSX Called ')
      await this.getStockPrice()
    }
    else {
      console.log('NoGSX Called ')

    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "Get_MaterialPriceObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "ItemList",
      "Value": this.getAccessoryMarginListXml()
    })
    console.log('requestData', requestData)
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Response ", requestData)
    this.ngxSpinnerService.show()

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            console.log("Response ", data)

            // if (Array.isArray(data?.MaterialItem)) {
            //   this.FinalPriceListDetailsList =data?.MaterialItem
            // }
            // else {
            //   this.FinalPriceListDetailsList.push(data?.MaterialItem)
            // }

            this.FinalPriceListDetailsList =
              (Array.isArray(data?.MaterialItem) ? data.MaterialItem : [data.MaterialItem])
                .filter(x => x?.ItemCode);


            if (this.FinalPriceListDetailsList.length < 1) {
              this.toastMessage.info("No Price List Information Available!")
            }



            else {

              this.FinalPriceListDetailsList.forEach(item => {
                item.GSTPercentage = item?.GSTPercentage
                item.TaxableAmount = item?.UnitPrice
                item.TaxAmount = item?.UnitPrice
                item.GSTAmount = item?.TaxableAmount * (item?.GSTPercentage / 100)
                item.TaxAmount = item?.GSTAmount
                item.NetAmount = parseFloat(item?.TaxableAmount) + parseFloat(item?.TaxAmount)
              })

              this.IsShowTable = true;

            }

            console.log('FinalPriceListDetailsList', this.FinalPriceListDetailsList)
            this.ngxSpinnerService.hide()
          }
          else {
            this.toastMessage.error("No records found")
            this.ngxSpinnerService.hide()

          }

        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()

        }
      });
  }

  // 

  async getStockPrice(): Promise<void> {


    let tempSelectedElements = [...this.FinalPriceListDetailsList];
    let apiCalls: Promise<void>[] = [];

    while (tempSelectedElements.length > 0) {

      const partlist = tempSelectedElements
        .splice(0, 5)
        .map(x => x?.MaterialPriceGroup);

      const requestdata = { partNumbers: partlist };
      const data = { Content: JSON.stringify(requestdata) };

      apiCalls.push(
        new Promise<void>((resolve, reject) => {

          this.gsxService.getPartsSummary(data).subscribe({
            next: (value) => {

              const response = JSON.parse(value.toString());
              console.log('api response ', response);

              if (response?.errors?.length) {
                response.errors.forEach(err =>
                  this.toastMessage.error(
                    `${err.code} - ${err.message}`,
                    'Error',
                    { closeButton: true, disableTimeOut: true }
                  )
                );
              } else {
                for (let object of response) {
                  for (let item of this.FinalPriceListDetailsList
                  ) {
                    if (item?.MaterialPriceGroup === object.number) {

                      if (item.PricingOption === 'ExchangePrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.exchangePrice ?? 0)
                      }
                      else if (item.PricingOption === 'StockPrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.stockPrice ?? 0);
                      }
                      else if(object?.pricingOptions) {
                        const option = object?.pricingOptions?.find(x => x?.description === item.PricingOption);
                        item.UnitPrice = this.dynamicService.removeCommas(option?.price ?? 0);
                      }
                      item.PriceSource = 'GSX';
                    }
                  }
                }
              }
            },
            error: err => {
              this.toastMessage.error('Please try again. ' + err);
              reject(err);
            },
            complete: () => {
              resolve();
            }
          });

        })
      );
    }

    try {
      await Promise.all(apiCalls);
      this.ngxSpinnerService.hide();
      console.log('getStockPrice fully completed');
    } catch (err_3) {
      this.ngxSpinnerService.hide();
      throw err_3;
    }
  }


}
