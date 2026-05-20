import { Component, OnInit } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from "../../config/global";
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';

@Component({
  selector: 'app-stock-transfer-order-list',
  templateUrl: './stock-transfer-order-list.component.html',
  styleUrls: ['./stock-transfer-order-list.component.sass']
})
export class StockTransferOrderListComponent implements OnInit {

  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
  ) { }

  typeSelected = 'ball-clip-rotate';
  TransferOrderDocType: DropDownValue = DropDownValue.getBlankObject();
  TransferOrderDocTypeData: string;
  params:any;
  results : any[] = [];

  ngOnInit(): void {
    this.onTransferOrderType({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.doctype != null || this.params.doctype != undefined) {
      this.TransferOrderDocTypeData = this.params.doctype.toUpperCase()
    }
    this.getTransferOrderList()

  }

  navigateToTransferOrder(item)
  {
    this.router.navigate(['auth/'+glob.getCompanyCode()+'/transfer-order'],{queryParams:{headerguid:item.TransferOrderHeaderGUID,doctype:this.TransferOrderDocTypeData}})
  }
  onTransferOrderType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.StoDocType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TransferOrderDocType = value;
        }
      },
      error: (err) => {
        this.TransferOrderDocType = DropDownValue.getBlankObject();
      }
    });
  }

  getTransferOrderList()
  {
     
    this.results = []
    if(this.TransferOrderDocTypeData != null || this.TransferOrderDocTypeData != undefined)
    {
     let requestData = []
     this.ngxSpinnerService.show();
      requestData.push({
        "Key":"APIType",
        "Value":"GetTransferOrderList"
      })
      requestData.push({
        "Key":"DocumentType",
        "Value":this.TransferOrderDocTypeData
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
              if (response.ReturnCode == '0') {
                let data = JSON.parse(response?.ExtraData);
                
                if(Array.isArray(data?.TransferOrderList?.TransferOrder))
                {
                  this.results = data?.TransferOrderList?.TransferOrder
                }
                else
                {
                  this.results.push(data?.TransferOrderList?.TransferOrder)
                }
                this.ngxSpinnerService.hide()
              }
            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            console.log(err);
            this.ngxSpinnerService.hide()
          }
        }
      );
    }
    else
    {
      this.toast.error("Please Select DocType")
    }
    
  }

}
