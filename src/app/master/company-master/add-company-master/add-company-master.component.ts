import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from 'src/app/config/global'
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Company } from './company-master.metadata';
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-add-company-master',
  templateUrl: './add-company-master.component.html',
  styleUrls: ['./add-company-master.component.sass']
})
export class AddCompanyMasterComponent implements OnInit {constructor(
  private formBuilder: FormBuilder,
  private route: Router,
  private activatedRoute: ActivatedRoute,
  private dropdownDataService: DropdownDataService,
  private dynamicService: DynamicService,
  private toastMessage: ToastrService,
  private ngxSpinnerService: NgxSpinnerService,
) { }

formTitle: string = "Add"
isEdit:boolean = false;
params: any;
companyForm: FormGroup;
company: Company;
country:string;
Countries: DropDownValue = this.getBlankObject();
States: DropDownValue = this.getBlankObject();
errorMessage: string = "";



ngOnInit(): void {
  this.onCountrySearch({term:"",items:[] })

  this.params = this.activatedRoute.snapshot.queryParams;
  if (this.params.companyname != null || this.params.companyname != undefined) {
    this.getData()
    this.formTitle = "Edit"
    this.isEdit = true
  }
  // this.company = new Company();
  
  
  this.companyForm = this.formBuilder.group({
    CompanyCode: ['', Validators.required],
    CompanyName: ['', Validators.required],
    CompanyAddress: ['', Validators.required],
    CompanyAddress2: [''] , 
    City: ['', Validators.required],
    Country:['', Validators.required],
    State: ['', Validators.required] ,
    PostalCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    Phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    CompanyPrintName: ['', Validators.required] ,
    ContactPerson: [''] ,
    EmailID: ['', [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)]],
    PanNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    Phone2: [''] ,
    TanNo: [''] ,
    DefaultCurrency: [''] ,
    WebSite: [''] ,
    SAPCompanyCode: [''] ,
    CIN: [''] ,



    
   
  });
  // this.company.companyForm = this.companyForm;
  
}

slideval = false

public newslide(event: any): void {
  if (event.checked) {
    console.log('true')
  } else {
    console.log('false')
  }
}

getData() {
  //  
   let params = this.activatedRoute.snapshot.queryParams;
  let requestData = [];
  requestData.push({
    Key: "ApiType",
    Value:"GetCompanyMasterObject"
  });
  requestData.push({
    Key: "CompanyCode",  
    Value:this.params.companycode
  });
  requestData.push({
    Key: "CompanyName",  
    Value:this.params.companyname  
  }); 
  let strRequestData = JSON.stringify(requestData);
  let contentRequest = {
    content: strRequestData
  };
  this.ngxSpinnerService.show()
  this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
    {
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == '0') {
          let data = JSON.parse(response.ExtraData)?.Company;
          this.companyForm.patchValue({
              CompanyCode: data.CompanyCode,
              CompanyName: data.CompanyName,
              CompanyAddress: data.CompanyAddress,
              City:data.City,
              Country:data.CountryCode, 
              State:  data.StateCode,
              PostalCode: data.PostalCode,
              Phone: data.Phone,
              CompanyPrintName: data.CompanyPrintName,
              ContactPerson: data.ContactPerson,
              CompanyAddress2: data.CompanyAddress2,
              EmailID: data.EmailID,
              PanNo: data.PanNo,
              Phone2:data.Phone2,
              TanNo:data.TanNo,
              DefaultCurrency:data.DefaultCurrency,
              WebSite:data.WebSite,
              SAPCompanyCode:data.SAPCompanyCode,
              CIN:data.CIN,

          })
          this.onCountrySearch({term:"",items:[]})
          this.ngxSpinnerService.hide()
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

controlValidations() {
  Object.keys(this.companyForm.controls).forEach(field => {
      let controlValue = this.companyForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.companyForm.get(field).setErrors({incorrect:true})
        this.toastMessage.error(field + " Cannot be Empty")
      }
  })
}

returnPrevious()
{
  this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/company-master')
}


getErrorMessage(control: string): string {
  let formControl = this.companyForm.controls[control];
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

onCountrySearch($event: { term: string; items: any[] }) {
  this.dropdownDataService.fetchDropDownData(DropDownType.Country, $event.term).subscribe({
    next: (value) => {
      if (value != null)
       {
        this.Countries = value;
        this.States = this.getBlankObject();
        this.onStatesSearch({ term: "", items: [] });      
      } 
    },
    error: err => {
      this.Countries = this.getBlankObject();      
    }
  });
  }

  onStatesSearch($event: { term: string; items: any[] }) {
    console.log("Country", this.companyForm.value)
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode : this.companyForm.value.Country
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.States = value;
          console.log("State: " ,this.States)
        }
      },
      error: err => {
        this.States = this.getBlankObject();
      }
    });
  }

  onSubmit() {
    let dataValue = this.companyForm.value
    let isFormValid = this.dynamicService.validateAllFormFields(this.companyForm)
    console.log("Return validation:- ", isFormValid)
    
    if(isFormValid){
      // return
      let requestData = [];
      requestData.push({
      "Key": "ApiType",
      "Value": "SaveCompanyMaster"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": dataValue.CompanyCode
      });
      requestData.push({
        "Key": "CompanyName",
        "Value": dataValue.CompanyName,
      });
      requestData.push({
        "Key": "CompanyPrintName",
        "Value": dataValue.CompanyPrintName
      });
      requestData.push({
        "Key": "CompanyAddress",
        "Value": dataValue.CompanyAddress,
      });
      requestData.push({
        "Key": "CompanyAddress2",
        "Value": dataValue.CompanyAddress2,
      });
      requestData.push({
        "Key": "City",
        "Value": dataValue.City,
      });

      requestData.push({
        "Key": "CountryCode",
        "Value": this.companyForm.controls["Country"].value
      });
      requestData.push({
        "Key": "StateCode",
        "Value": this.companyForm.controls["State"].value
      });

      requestData.push({
        "Key": "PostalCode",
        "Value": dataValue.PostalCode
      });
      requestData.push({
        "Key": "Phone",
        "Value": dataValue.Phone
      });

      requestData.push({
        "Key": "EmailID",
        "Value": dataValue.EmailID
      });
      requestData.push({
        "Key": "ContactPerson",
        "Value": dataValue.ContactPerson
      });
      requestData.push({
        "Key": "PanNo",
        "Value": dataValue.PanNo
      });
      requestData.push({
        "Key": "Phone2",
        "Value": dataValue.Phone2
      });
      requestData.push({
        "Key": "TanNo",
        "Value": dataValue.TanNo
      });
      requestData.push({
        "Key": "DefaultCurrency",
        "Value": dataValue.DefaultCurrency
      });
      requestData.push({
        "Key": "WebSite",
        "Value": dataValue.WebSite
      });
      requestData.push({
        "Key": "SAPCompanyCode",
        "Value": dataValue.SAPCompanyCode
      });
      requestData.push({
        "Key": "CIN",
        "Value": dataValue.CIN
      });
      ;
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      // return;
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.toastMessage.success("Data Submitted Successfully!")
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
            console.log(err);
            if(err.includes('"message":"Cannot'))
            {
              this.controlValidations()
            }
          }
        });
    }
  }


  // Key Press Validations
  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }



}







