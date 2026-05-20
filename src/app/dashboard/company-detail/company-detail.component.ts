import { Component, Inject, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from 'src/app/config/global'
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit {
  orgRoleId: string = '';
  defaultCompanyCode: string = '';
 
  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toast: ToastrService,
    private route: Router,
    private gsxService: GsxService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<CompanyDetailComponent>,
    private ngxSpinnerService: NgxSpinnerService,
   
  ) {}
  gsxAuthKey:string;
  companyCodeData:string;
  disableAuthPart:boolean = false;
  hidesubmit:boolean=true;
  companyCode: DropDownValue = DropDownValue.getBlankObject();
  authKeyDisable: boolean = true;
  gsxUserId:string;
  userName:string;


  ngOnInit(): void {
    this.onCompany4OrgRoleSearch({ term: "", item: [] });
    let userdata = []
    userdata.push(glob.getLogedInUser()["UserDetails"])
    for(let item of userdata)
    {
      this.userName = item.UserName
      this.gsxUserId = item.GsxUserId
      this.defaultCompanyCode = item.DefaultCompanyCode
      if (item.GsxIdFlag == 0)
      {
       this.disableAuthPart = true
       this.hidesubmit=false;
      }
      else
      {
        this.getData()
      }
    }
    this.companyCodeData = this.defaultCompanyCode
  }
  

  getData()
  {  
    this.ngxSpinnerService.show()
    this.gsxService.fetchUserDetail().subscribe({
      next:(value) =>{
        this.ngxSpinnerService.hide()
        let response = value
        
        if(response["gsxValidToken"] == true)
        {
          this.toast.success("GSX Token Validated successfully")
          this.authKeyDisable=true;
          this.hidesubmit=false;
        }
        else
        {
          this.toast.info("Please Update GSX Activation Token")
          this.authKeyDisable = false;
          this.hidesubmit=true;
        }
      },
      error: err =>{
        console.log(err)
        this.ngxSpinnerService.hide()
      }
    })
  }


  submit()
  {
    if(this.companyCodeData == null || this.companyCodeData == undefined)
    {
      this.toast.error("Please select Company")
    }
    else
    {
      glob.setCompanyCode(this.companyCodeData.trim())
     /*  ;
      if(glob.getLogedInUser().UserDetails.MenuGroupId==2)
      {
        this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/token-create')  
      }
      else
      {
        this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/dashboard')
      }*/
      
      this.dialogRef.close(this.companyCodeData.trim());
    }
  }

  updateGsxToken()
  {
    if(this.gsxAuthKey == null || this.gsxAuthKey == undefined)
    {
      this.toast.error("Please enter your gsx Auth Key")
    }
    else
    {
      let data = {
        "ActivationToken":this.gsxAuthKey,
        "UserName":this.userName,
        "GsxUserId":this.gsxUserId
      }
      var strRequestData = JSON.stringify(data)
      var requestdata = {
        "Content": strRequestData
      }
      
       
      this.gsxService.saveGsxTokenDetail(requestdata).subscribe({
        next:(value:any) =>{
           
          
          var response = JSON.parse(value);
          
          if(response.gsxTokenSaved == true)
          {
            this.toast.success("GSX Activation Token Saved successfully")
            this.authKeyDisable = true
            this.hidesubmit=true
            this.getData()
          }
        },
        error: err=>{
          console.log(err)
          this.toast.error(err)
        }
      })
    }
  }

  // onCompanySearch($event: { term: string; item: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.Company, $event.term, {
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         if(value.Data.length == 1)
  //         {
  //           for(let item of value.Data)
  //           {
  //             this.companyCodeData = item.Id
  //           }
  //         }
  //         this.companyCode = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.companyCode = DropDownValue.getBlankObject();
  //     }
  //   });
  // }

  onCompany4OrgRoleSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BindCompany4Username, "", {
      OrgRoleId: this.orgRoleId
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.companyCode = value;
        }
      },
      error: (err) => {
        this.companyCode = DropDownValue.getBlankObject();
      }
    });
  }



}
