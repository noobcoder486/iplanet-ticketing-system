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
  selector: 'app-goods-movement-list',
  templateUrl: './goods-movement-list.component.html',
  styleUrls: ['./goods-movement-list.component.css']
})
export class GoodsMovementListComponent implements OnInit {

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
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  GMDocType: DropDownValue = DropDownValue.getBlankObject();
  GMDocTypeData: string;
  locationData: string;
  params:any;
  results : any[] = [];

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onGMDocType({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.doctype != null || this.params.doctype != undefined) {
      this.GMDocTypeData = this.params.doctype.toUpperCase()
    }
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

  onGMDocType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DocumentType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GMDocType = value;
        }
      },
      error: (err) => {
        this.GMDocType = DropDownValue.getBlankObject();
      }
    });
  }


  getGoodsMovementList()
  {
    this.results = []
    if(this.locationData != null || this.locationData != undefined)
    {
     let requestData = []
     this.ngxSpinnerService.show();
      requestData.push({
        "Key":"APIType",
        "Value":"GetGoodsMovementList"
      })
      requestData.push({
        "Key":"DocumentType",
        "Value":this.GMDocTypeData
      })
      requestData.push({
        "Key":"LocationCode",
        "Value":this.locationData
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
                if(Array.isArray(data?.GoodsMovementList?.GoodsMovement))
                {
                  this.results = data?.GoodsMovementList?.GoodsMovement
                }
                else
                {
                  this.results.push(data?.GoodsMovementList?.GoodsMovement)
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
      this.toast.error("Please Select Location")
    }
    
  }

  navigateToGoodsMovement(item)
  {
    this.router.navigate(['auth/'+glob.getCompanyCode()+'/goods-movement'],{queryParams:{doctype:item.DocumentType,headerguid:item.GoodsMovementHeaderGUID}})
  }


}
