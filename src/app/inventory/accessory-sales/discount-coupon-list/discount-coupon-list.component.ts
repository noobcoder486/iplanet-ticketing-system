import { Component, OnInit, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { lastValueFrom } from 'rxjs';
import xml2js from 'xml2js';


 
@Component({
  selector: 'app-discount-coupon-list',
  templateUrl: './discount-coupon-list.component.html',
  styleUrls: ['./discount-coupon-list.component.css']
})
export class DiscountCouponListComponent implements OnInit {

  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService
  ) { }

  typeSelected = 'ball-clip-rotate';
  Location: DropDownValue = DropDownValue.getBlankObject();
  LocationCode:string;
  materialCode: string = ''
  results:any[] = []
  DiscountCouponDD= ['SENT FOR APPROVAL', 'APPROVED', 'REJECTED', 'PARTIALLY APPROVED']
  DiscountCouponStatus: any;
  itemDiscountStatus: string;
  InvoiceDocTypeDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceDocType =''
  isApproverL1 = false;
  isApproverL2 = false;
  LocationData = new Set<string>();
  CouponCode
  // InvoiceDocType = [ 'APPROVED', 'REJECTED']

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    // this.IsApproverObject();
    this.GetDiscountCouponList('')
  }


  GetDiscountCouponList(eventDetail) {
  
    let requestData =[]
    requestData.push({
      "Key": "APIType",
      "Value": "GetDiscount4CustomerList"
    });
    requestData.push({
      "Key":"DiscountCouponStatus",
      "Value":  this.DiscountCouponStatus == null || this.DiscountCouponStatus == undefined ? '' : this.DiscountCouponStatus
    })
    
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.materialCode == null || this.materialCode == undefined?"":this.materialCode
    });
    requestData.push({
      "Key": "CouponCode",
      "Value": this.CouponCode == null || this.CouponCode == undefined?"":this.CouponCode
    });
    

    requestData.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestData.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    // console.log("Before SP:-", requestData)
    this.ngxservice.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxservice.hide()
          this.results = []
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              // console.log("After SP:- ", data)
              if(data?.Totalrecords < 1)
              {
                this.toast.info("No Record Found")
                this.results =[]
                return
              }
              // 
              if (Array.isArray(data?.DiscountCouponList?.DiscountCoupon)) {
                this.results = data?.DiscountCouponList?.DiscountCoupon
                this.results.forEach( (item) => {
                  this.LocationData.add(item.LocationCode)
                })
              }
              else {
                this.results.push(data?.DiscountCouponList?.DiscountCoupon)
                this.LocationData.add(data?.DiscountCouponList?.DiscountCoupon?.LocationCode)
              }
              this.IsApproverObject()
            }
          } catch (ext) {
            this.ngxservice.hide()
            console.log(ext);
          }
        },
        error: err => {
          this.ngxservice.hide()
          console.log(err);
        }
      }
    );
  }
    
  GetLocationDataXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.LocationData) {
      count += 1
      rawData.rows.push({
        "row": {
          "LocationCode": item,
          }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("XML is:- ", xml)
    return xml;
  }

  

  async IsApproverObject(){
    this.ngxservice.show()
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "DiscountApproval"
    })
    requestData.push({
      "Key": "LocationXML",
      "Value":this.GetLocationDataXML() 
    })
    requestData.push({
      "Key": "XmlFlag",
      "Value": true
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest ={
      "content": strRequestData,
    }
    console.log("Approval Object ", requestData)
    try {
        this.ngxservice.hide();
        const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
        const value = await lastValueFrom(observable);

        const response = JSON.parse(value.toString());
        console.log("Approval Object Response", response)
        if (response.ReturnCode == '0') {
          let userName  = sessionStorage.getItem(glob.GLOBALVARIABLE.USERNAME);
          let data = JSON.parse(response?.ExtraData);
          console.log("Approval Object Extra", data);
          let ApprovalRow =  Array.isArray(data.ApprovalList.ApprovalRow) ? data.ApprovalList.ApprovalRow : [data.ApprovalList.ApprovalRow];
          console.log("Approval Row", ApprovalRow);
          this.results.forEach( (item) =>{
            let isApproverL1 = ApprovalRow.some( row => row.ApprovalPerson == userName && row.LocationCode== item.LocationCode && row.ApprovalLevel == 'L1')
            let isApproverL2 = ApprovalRow.some( row => row.ApprovalPerson == userName && row.LocationCode== item.LocationCode &&  row.ApprovalLevel == 'L2')
            item.isApproverL1 = isApproverL1
            item.isApproverL2 = isApproverL2
          })
          console.log("Reults ",this.results)
        } else {
          console.log("Error in getting the Approval Object");
        }
      } catch (error) {
        this.ngxservice.hide();
        console.log("Error:- ", error);
        // Handle the error
      }
  }

  hasApproverL1(): boolean {
    if ( this.results.some(row => row.isApproverL1 === true && row.DiscountCouponStatus == 'SENT FOR APPROVAL') ){
      return true;
    }
    else{
      return false;
    }
  }
  hasApproverL2(): boolean {
    if ( this.results.some(row => row.isApproverL2 === true && row.DiscountCouponStatus == 'PARTIALLY APPROVED')){
      return true;
    } 
    else{
      return false;
    }
  }


  search(event){
    // if ( this.DiscountCouponStatus == null || this.DiscountCouponStatus == undefined ){
    //   this.toast.error("Please Select a Status");
    //   return
    // }
   
    this.GetDiscountCouponList('');
  }

 

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Location = value;
        }
      },
      error: (err) => {
        this.Location = DropDownValue.getBlankObject();
      }
    });
  }
  

  updateDiscount(item)
  {
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    this.route.navigate(['auth/' + glob.getCompanyCode() + '/discount-coupon'], {queryParams: { couponcode: item.CouponCode}})
  }


}
