import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { Material } from './material-master.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';


@Component({
  selector: 'app-add-material-master',
  templateUrl: './add-material-master.component.html',
  styleUrls: ['./add-material-master.component.sass']
})
export class AddMaterialMasterComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
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
  material: Material;
  errorMessage: String;
  PartType: DropDownValue = this.getBlankObject();
  ItemTypeDD: DropDownValue = this.getBlankObject();
  PriceGroup: DropDownValue = this.getBlankObject();
  PriceListDetailsList: any[] = []

  MatGroup1DD: DropDownValue = this.getBlankObject();
  MatGroup2DD: DropDownValue = this.getBlankObject();
  MatGroup3DD: DropDownValue = this.getBlankObject();
  MatGroup4DD: DropDownValue = this.getBlankObject();
  BrandDD: DropDownValue = this.getBlankObject();
  MaterialCategoryDD: DropDownValue = this.getBlankObject();

  MaterialPriceSourceDD: DropDownValue = this.getBlankObject();






  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.getPriceListData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.material = new Material();
    this.material.materialForm = this.materialForm;

    this.materialForm = this.formBuilder.group({
      MaterialCode: [null, Validators.required],
      MaterialName: [null, Validators.required],
      MaterialDescription: [null, Validators.required],
      PartType: [null, Validators.required],
      EEECode: [null],
      SubstitutePart: [null],
      ComponentGroup: [null],
      SerializedModule: [null, Validators.required],
      ERPMaterialCode: [null],
      LaborTier: [null],
      PriceGroup: [null, Validators.required],
      DivisionCode: [null, Validators.required],
      RevenueType: [null, Validators.required],
      CostPrice: [null, Validators.required],
      BaseUOM: [null, Validators.required],
      SalesUOM: [null, Validators.required],
      ItemType: [null, Validators.required],
      ERPSerialized: [null, Validators.required],
      isDeleted: [null, Validators.required],

      MatGroup1: [null],
      MatGroup2: [null],
      MatGroup3: [null],
      MatGroup4: [null],

      Brand: [null],
      MatCategory: [null],

      PriceSource: [null,Validators.required],
      IsMarginPriceApplicable: [null],


    });

    this.onPartType({ term: '', items: [] })
    this.onItemType({ term: '', items: [] })
    this.onPriceGroup({ term: '', items: [] })

    this.OnMatGroup1DD({ term: '', items: [] })
    this.OnMatGroup2DD({ term: '', items: [] })
    this.OnMatGroup3DD({ term: '', items: [] })
    this.OnMatGroup4DD({ term: '', items: [] })
    this.onBrandDD({ term: '', items: [] })
    this.onMaterialCategoryDD({ term: '', items: [] })
    this.onMaterialPriceSourceDD({ term: '', items: [] })

  }

  slideval = false

  public newslide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }
  public isDeletedSlide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }
  public slideIsMarginPriceApplicable(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }

  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetMaterialObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": this.params.cc
    });
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.params.nc

    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            
            let data = JSON.parse(response.ExtraData)?.Material;
            
            this.material = data
            this.materialForm.patchValue({
              MaterialCode: data.MaterialCode,
              MaterialName: data.MaterialName,
              MaterialDescription: data.MaterialDescription,
              LaborTier: data.LaborTier,
              EEECode: data.EEECode,
              SubstitutePart: data.SubstitutePart,
              ComponentGroup: data.ComponentGroup,
              SerializedModule: data.SerializedModule == '1' ? true : false,
              ERPMaterialCode: data.ERPMaterialCode,
              PriceGroup: data.PriceGroup,
              PartType: data.PartType,
              DivisionCode: data.DivisionCode,
              RevenueType: data.RevenueType,
              BaseUOM: data.BaseUOM,
              SalesUOM: data.SalesUOM,
              ItemType: data.ItemType,
              ERPSerialized: data.ERPSerialized,
              isDeleted: data.isDeleted == '1' ? true : false,
              MatGroup1: data.MatGroup1,
              MatGroup2: data?.MatGroup2,
              MatGroup3: data?.MatGroup3,
              MatGroup4: data?.MatGroup4,
              Brand: data?.Brand,
              MatCategory: data?.MatCategory,
              PriceSource: data?.PriceSource,
              IsMarginPriceApplicable: data?.IsMarginPriceApplicable == '1' ? true : false

            })

          }
          else {
            console.log("error");
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }

  getPriceListData() {
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {

          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            
            this.materialForm.patchValue({
              CostPrice: data?.CostPrice
            })
            if (data?.PriceDetailsObject?.PriceDetails) {
              if (Array.isArray(data?.PriceDetailsObject?.PriceDetails)) {
                this.PriceListDetailsList = data?.PriceDetailsObject?.PriceDetails
              }
              else {
                this.PriceListDetailsList.push(data?.PriceDetailsObject?.PriceDetails)
              }
              this.PriceListDetailsList.forEach(item => {
                item.UnitPrice = parseFloat(item.UnitPrice)
                item.Margin = parseFloat(item.Margin)

                item.GSTPercentage = 18
                item.TaxableAmount = item.UnitPrice
                item.TaxAmount = item.UnitPrice
                item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
                item.TaxAmount = item.GSTAmount
                item.NetAmount = parseFloat(item.TaxableAmount) + parseFloat(item.TaxAmount)

              })
              console.log("Price ", this.PriceListDetailsList)


            }
            else {
              this.toastMessage.info("No Price List Information Available!")
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

  controlValidations() {
    Object.keys(this.materialForm.controls).forEach(field => {
      let controlValue = this.materialForm.get(field).value

      if (this.materialForm.get(field).hasValidator(Validators.required) == true) {
        if (controlValue == null || controlValue == undefined) {
          this.toastMessage.error(field + " Cannot be Empty")
          return false;
        }
      }
    })
  }

  returnPrevious() {
    this.route.navigateByUrl('/auth/' + glob.getCompanyCode() + '/material-master')
  }

  onSubmit() {
    
    this.dynamicService.validateAllFormFields(this.materialForm);
    if (this.materialForm.valid) {
      this.errorMessage = "";
      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveMaterialMaster"
      });
      requestData.push({
        "Key": "MaterialCode",
        "Value": this.material.MaterialCode
      });
      requestData.push({
        "Key": "MaterialDescription",
        "Value": this.material.MaterialDescription
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "MaterialName",
        "Value": this.material.MaterialName
      });
      requestData.push({
        "Key": "PartType",
        "Value": this.materialForm.controls["PartType"].value
      });
      requestData.push({
        "Key": "LaborTier",
        "Value": this.material.LaborTier
      });
      requestData.push({
        "Key": "EEECode",
        "Value": this.material.EEECode
      });
      requestData.push({
        "Key": "SubstitutePart",
        "Value": this.material.SubstitutePart
      });
      requestData.push({
        "Key": "ComponentGroup",
        "Value": this.material.ComponentGroup
      });
      requestData.push({
        "Key": "SerializedModule",
        "Value": this.material.SerializedModule
      });
      requestData.push({
        "Key": "ERPMaterialCode",
        "Value": this.material.ERPMaterialCode
      });
      requestData.push({
        "Key": "PriceGroup",
        "Value": this.materialForm.controls["PriceGroup"].value
      })
      requestData.push({
        "Key": "DivisionCode",
        "Value": this.material.DivisionCode
      });

      requestData.push({
        "Key": "BaseUOM",
        "Value": this.material.BaseUOM
      });
      requestData.push({
        "Key": "SalesUOM",
        "Value": this.material.SalesUOM
      });
      requestData.push({
        "Key": "ItemType",
        "Value": this.material.ItemType
      });
      requestData.push({
        "Key": "ERPSerialized",
        "Value": this.material.ERPSerialized
      });
      requestData.push({
        "Key": "RevenueType",
        "Value": this.material.RevenueType
      });
      requestData.push({
        "Key": "CostPrice",
        "Value": this.material.CostPrice
      });
      requestData.push({
        "Key": "Data",
        "Value": this.PriceListDetailsList.length > 0 ? this.PriceListXML() : ''
      });
      requestData.push({
        "Key": "isDeleted",
        "Value": this.material?.isDeleted
      });

      requestData.push({
        "Key": "MatGroup1",
        "Value": this.material?.MatGroup1 || ""
      });
      requestData.push({
        "Key": "MatGroup2",
        "Value": this.material?.MatGroup2 || ""
      });
      requestData.push({
        "Key": "MatGroup3",
        "Value": this.material?.MatGroup3 || ""
      });
      requestData.push({
        "Key": "MatGroup4",
        "Value": this.material?.MatGroup4 || ""
      });
      requestData.push({
        "Key": "Brand",
        "Value": this.material?.Brand || ""

      });

      requestData.push({
        "Key": "MatCategory",
        "Value": this.material?.MatCategory || ""
      });
      requestData.push({
        "Key": "PriceSource",
        "Value": this.material?.PriceSource || ""
      });
      requestData.push({
        "Key": "IsMarginPriceApplicable",
        "Value": this.material?.IsMarginPriceApplicable || 0
      });
      console.log('requestData', requestData)
      
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      ;
      // return   
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (Value) => {

            let response = JSON.parse(Value.toString());

            if (response.ReturnCode == '0') {
              this.toastMessage.success("Form Submitted Successfully");
              this.returnPrevious()
            }
            else {
              

              this.errorMessage = response.ReturnMessage;

              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                result.ERRORLIST.ERRORMESSAGE.forEach(err => {
                  this.toastMessage.error("Error", err.ERRORMESSAGE[0], { closeButton: true, disableTimeOut: true })
                });
                this.handleError(response);
              });
            }

          },
          error: err => {
            console.log(err);
            if (err.includes('"message":"Cannot')) {
              this.controlValidations()
            }
          }
        });
    }
    else {
      console.log("Error in valid");
    }
  }

  PriceListXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.PriceListDetailsList) {
      count += 1
      rawData.rows.push({
        "row": {
          "Margin": item.Margin == null || item.Margin == undefined ? 0 : item.Margin,
          "PricingOption": item.PricingOption,
          "UnitPrice": item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString(),
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log(xml)
    return xml;
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

  onPartType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.PartType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.PartType = value;
        }
      },
      error: (err) => {
        this.PartType = this.getBlankObject();
      }
    });
  }
  onItemType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ItemType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ItemTypeDD = value;
        }
      },
      error: (err) => {
        this.ItemTypeDD = this.getBlankObject();
      }
    });
  }

  onPriceGroup($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.MatPriceGroup, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.PriceGroup = value;
        }
      },
      error: (err) => {
        this.PriceGroup = this.getBlankObject();
      }
    });
  }

  onComponentGroup($event) {
    
    this.material.ComponentGroup = $event.TEXT;
  }
  onLaborTier($event) {
    
    this.material.LaborTier = $event.TEXT;
  }


  // 



  OnMatGroup1DD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATGROUP1, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MatGroup1DD = value;
        }
      },
      error: (err) => {
        this.MatGroup1DD = this.getBlankObject();
      }
    });
  }

  OnMatGroup2DD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATGROUP2, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MatGroup2DD = value;
        }
      },
      error: (err) => {
        this.MatGroup2DD = this.getBlankObject();
      }
    });
  }

  OnMatGroup3DD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATGROUP3, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MatGroup3DD = value;
        }
      },
      error: (err) => {
        this.MatGroup3DD = this.getBlankObject();
      }
    });
  }

  OnMatGroup4DD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATGROUP4, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MatGroup4DD = value;
        }
      },
      error: (err) => {
        this.MatGroup4DD = this.getBlankObject();
      }
    });
  }

  onBrandDD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BRAND, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BrandDD = value;
        }
      },
      error: (err) => {
        this.BrandDD = this.getBlankObject();
      }
    });
  }

  onMaterialCategoryDD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATCATEGORY, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MaterialCategoryDD = value;
        }
      },
      error: (err) => {
        this.MaterialCategoryDD = this.getBlankObject();
      }
    });
  }



  onMaterialPriceSourceDD($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MATPRICESOURCE, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.MaterialPriceSourceDD = value;
        }
      },
      error: (err) => {
        this.MaterialPriceSourceDD = this.getBlankObject();
      }
    });
  }


  onPriceSourceChange($event) {

    

    console.log('onPriceSourceChange', $event)

    if ($event.Id == 'GSX') {

      this.material.PriceGroup = 'DEFAULT'
      this.materialForm.get('PriceGroup')?.setValue('DEFAULT');

      this.material.IsMarginPriceApplicable = true
      this.materialForm.get('IsMarginPriceApplicable')?.setValue(true);

    }
    else {

      this.material.PriceGroup = null
      this.materialForm.get('PriceGroup')?.setValue(null);
      this.material.IsMarginPriceApplicable = false
      this.materialForm.get('IsMarginPriceApplicable')?.setValue(false);
    }




  }


}
