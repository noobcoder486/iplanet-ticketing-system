import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { getCompanyCode } from 'src/app/config/global';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import xml2js from 'xml2js';

@Component({
  selector: 'app-add-tote-management',
  templateUrl: './add-tote-management.component.html',
  styleUrls: ['./add-tote-management.component.css']
})
export class AddToteManagementComponent implements OnInit {

  storeCode: string = '';
  receivedFrom: string = '';
  boxType: string = '';
  ToteNo:any;
  dcNo: string = '';
  awbNo: string = '';
  receivedBy: string = '';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  BulkReturnTypeDD: DropDownValue = DropDownValue.getBlankObject();
  BoxTypeDD: DropDownValue = DropDownValue.getBlankObject();
  BulkReturnType:any
  SealNo:any
  params:any

  ToteList:any[]=[];
  
  isEdit:boolean=false;
  PageTitle = "Add Tote Details"
  isUpdating:boolean=false;

  constructor(
    private toastrService: ToastrService,
    private dynamicService: DynamicService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private dropdownDataService: DropdownDataService,
         private activatedRoute: ActivatedRoute,

  ) { }
  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
      if (this.params.ToteGuid != null || this.params.ToteGuid != undefined) {
           this.PageTitle="Edit Tote Details"
          this.getData()
       }
        this.onLocationSearch({ term: "", item: [] });
    this.onBulkReturnType({ term: "", item: [] });
    this.onBoxType({ term: "", item: [] })
     this.boxType ='TOTE';
        
  }
  onBulkReturnType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BulkReturnType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BulkReturnTypeDD = value;
          console.log("Bulk Return Type ", this.BulkReturnTypeDD)
        }
      },
      error: (err) => {
        this.BulkReturnTypeDD = DropDownValue.getBlankObject();
      }
    });
  }
  onBoxType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BOXTYPE, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BoxTypeDD = value;
          console.log("Bulk Return Type ", this.BulkReturnTypeDD)
        }
      },
      error: (err) => {
        this.BoxTypeDD = DropDownValue.getBlankObject();
      }
    });
  }
  
    onLocationSearch($event: { term: string; item: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
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

  isSaving: boolean = false;
  SaveTote() {
    this.isSaving = true


    if (this.storeCode === '' || this.boxType == ''  || this.dcNo.trim() == '' || this.awbNo.trim() == '' || this.BulkReturnType  == '' ) {
      this.toastrService.error('Please fill all the fields', 'Error');
      this.isSaving = false;
      return;
    }

     if(this.ToteList.length <=0){
      this.toastrService.error('Please Enter Atleast One tote to continue !');
      this.isSaving = false;
      return;
     }

    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveTote"
    });
     requestData.push({
      "Key": "CompanyCode",
      "Value": getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.storeCode
    });
   
    requestData.push({
      "Key": "BulkReturnType",
      "Value": this.BulkReturnType
    });
   
    requestData.push({
      "Key": "BoxType",
      "Value": this.boxType
    });
   
    requestData.push({
      "Key": "DCNo",
      "Value": this.dcNo == null || this.dcNo == undefined  || this.dcNo.trim()==''? '' : this.dcNo
    });
    requestData.push({
      "Key": "AWBNo",
      "Value": this.awbNo == null || this.awbNo == undefined  || this.awbNo.trim()==''? '' : this.awbNo
    });
    requestData.push({
      "Key": "ToteDetails",
      "Value": this.ToteDetailsIntoXML()
    });
   
    console.log("Request Data", requestData);
    let strRequestData = JSON.stringify(requestData);
    console.log("Stringified Request Data", strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {

        next: (value) => {
          
          this.spinner.hide();

          console.log("Response:", value);

          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.success("Tote saved successfully", "Success",)

            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/tote-management/']);
            this.isSaving = false
          }
          if (response.ReturnCode == '1') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.error(response?.ErrorMessage , 'Error')
            this.isSaving = false
          }
        },
        error: err => {
          this.spinner.hide();
          this.isSaving = false;
          this.toastrService.error("Server error", "Error");
          console.error(err);
        }
      });

  }

  ToteDetailsIntoXML() {
     console.log("this.ToteList ", this.ToteList)
     let rawData = { "rows": [] }
     for (let item of this.ToteList) {
       rawData.rows.push({
         "row": {
           "ToteNo" : item.ToteNo,
           "SealNo" : item.SealNo
         }
       })
     }
     var builder = new xml2js.Builder();
     var xml = builder.buildObject(rawData);
     xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
     xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
     xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); 
     console.log("xml", xml);
     return xml;
   }
 
 
  Additem(){
        if(this.ToteNo == null || this.ToteNo == undefined ||  this.ToteNo == ''){
           this.toastrService.error('Empty Tote Cannot be Added !');
           return;
        }
        if(this.SealNo == null || this.SealNo == undefined ||  this.SealNo == ''){
           this.toastrService.error('Empty Seal No Cannot be Added !');
           return;
        }
        const isDuplicate = this.ToteList.some(item => 
          item.ToteNo === this.ToteNo && item.SealNo === this.SealNo
        );
        if(isDuplicate){
          this.toastrService.error('This Tote and SealNo Already Addedd !');
           return;
        }

      if (!isDuplicate) {
        this.ToteList.push({
          'ToteNo': this.ToteNo,
          'SealNo': this.SealNo
        });
      }
        
    
        // this.ToteList.push({
        //   'ToteNo' : this.ToteNo,
        //   'SealNo' : this.SealNo
        // })

     this.ToteNo =null;
     this.SealNo = null ;
       console.log('ToteList' , this.ToteList);
  }

  RemoveItem(item ){
      let i =  this.ToteList.indexOf(item);
        this.ToteList.splice(i,1);
       console.log('this.ToteList after removing the item ' , this.ToteList);
  }



  cancel() {
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/tote-management/']);
  }
 ToteUpdationDeletion(){
    
    if(this.ToteNo == null || this.ToteNo == undefined || this.ToteNo.trim() =='' ){
      this.toastrService.error("Tote No Cannot be Empty !!")
      return
    }
     if(this.SealNo == null || this.SealNo == undefined || this.SealNo.trim() =='' ){
      this.toastrService.error("Seal No Cannot be Empty !!")
      return
    }
      if(this.BulkReturnType == null || this.BulkReturnType == undefined || this.BulkReturnType =='' ){
      this.toastrService.error("Bulk Return Type Cannot be Empty !!")
      return
    }
      if(this.boxType == null || this.boxType == undefined || this.boxType =='' ){
      this.toastrService.error("Box Type Cannot be Empty !!")
      return
    }
   
      if(this.dcNo== null ||this.dcNo == undefined || this.dcNo.trim() =='' ){
      this.toastrService.error("DC No.  Cannot be Empty !!")
      return
    }
     if(this.storeCode== null ||this.storeCode == undefined || this.storeCode.trim() =='' ){
      this.toastrService.error("Store Code Cannot be Empty !!")
      return
    }
   
     if(this.awbNo== null ||this.awbNo == undefined || this.awbNo.trim() =='' ){
      this.toastrService.error("AWB No.  Cannot be Empty !!")
      return
    }
   
       

     this.spinner.show()
     
      this.isUpdating=true;
      let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ToteUpdationDeletion"
    });
     requestData.push({
      "Key": "ToteGuid",
      "Value": this.params.ToteGuid
    });
    requestData.push({
      "Key": "ToteNo",
      "Value": this.ToteNo
    });
     requestData.push({
      "Key": "SealNo",
      "Value": this.SealNo
    });
     requestData.push({
      "Key": "BulkReturnType",
      "Value": this.BulkReturnType
    });
     requestData.push({
      "Key": "BoxType",
      "Value": this.boxType
    });
      requestData.push({
      "Key": "DCNo",
      "Value": this.dcNo == null || this.dcNo == undefined  || this.dcNo.trim()==''? '' : this.dcNo
    });
     requestData.push({
      "Key": "AWBNo",
      "Value": this.awbNo == null || this.awbNo == undefined  || this.awbNo.trim()==''? '' : this.awbNo
    });
     requestData.push({
      "Key": "CompanyCode",
      "Value": getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.storeCode
    });
   requestData.push({
      "Key": "Type",
      "Value": 'UPDATION'
    });
     
    console.log("Request Data", requestData);
    let strRequestData = JSON.stringify(requestData);
    console.log("Stringified Request Data", strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {

        next: (value) => {
          
          this.spinner.hide();

          console.log("Response:", value);
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.success('Updated Successfully !')
            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/tote-management/']);
            this.isUpdating = false
          }
          if (response.ReturnCode == '1') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.error(response?.ErrorMessage , 'Error')
            this.isUpdating = false
          }
        },
        error: err => {
          this.spinner.hide();
          this.isUpdating = false;
          this.toastrService.error("Server error", "Error");
          console.error(err);
        }
      });

   }

 getData(){ 
    
    let requestData= [];
    requestData.push({
      "Key":"APIType",  
      "Value": "GetToteObject"
    });
    requestData.push({
      "Key": "ToteGuid",
      "Value": this.params.ToteGuid
    });  
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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
              let data = JSON.parse(response.ExtraData) 
               this.storeCode = data?.LocationCode;
               this.BulkReturnType=data?.BulkReturnType;
               this.boxType=data?.BoxType;
               this.awbNo=data?.AWBNo;
               this.dcNo =data?.DCNo;
               this.SealNo =data?.SealNo;
               this.ToteNo=data?.ToteNo;
               this.isEdit=true;
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

}
