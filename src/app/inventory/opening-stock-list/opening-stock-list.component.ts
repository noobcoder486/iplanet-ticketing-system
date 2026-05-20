import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as glob from "../../config/global";

@Component({
  selector: 'app-opening-stock-list',
  templateUrl: './opening-stock-list.component.html',
  styleUrls: ['./opening-stock-list.component.sass']
})
export class OpeningStockListComponent implements OnInit {

  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private toast: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
  ) { }
  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  Ship_to_GSX : string;
  results : any[] = [];
  materialCode: string = ''
  materialName: string = ''
  showonlyselected: boolean = false;
  searchText: String = "";
  SelectedPartCount: Number = 0;
  SelectedMaterialList: any[]= []
  @Output() materialList  = new EventEmitter<any>();
  @Input() stockTypeData: string;

  ngOnInit(): void {
    this.GetMaterialList('','')
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }


  search() {
    this.GetMaterialList(this.materialCode, this.materialName);
  }

  GetMaterialList(materialcode, materialname)
  {
    this.results = []
     ;
    this.ngxSpinnerService.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetMaterialList"
    });
    requestData.push({
      "Key": "MaterialName",
      "Value": materialname
    });
    requestData.push({
      "Key": "MaterialCode",
      "Value": materialcode
    });
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "50"
    });
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
              this.toast.success("Opening Stocks Found")
              let data = JSON.parse(response?.ExtraData);

              if(Array.isArray(data?.MaterialList?.Material))
              {
                this.results = data?.MaterialList?.Material
              }
              else
              {
                this.results.push(data?.MaterialList?.Material)
              }
              console.log(this.results)
              this.ngxSpinnerService.hide()
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

  isToShowTr(item): Boolean {
    if (this.showonlyselected == false) {
      if (this.searchText.length <= 1) {
        return true;
      } else if (item.selected == true) {
        return true;
      } else if (item.inSearch) {
        return true;
      } else {
        return false;
      }
    }
    else {
      if (item.selected == true) {
        return true;
      } else {
        return false;
      }

    }
  }
  UpdateSelectedCount(item) {
    this.SelectedPartCount = this.results.filter(x => x.selected == true).length;
    if(item.selected == true)
    {
      if(this.SelectedMaterialList.some(m => m.MaterialCode === item.MaterialCode))
      {
        this.toast.error("This stock has already been selected")
      }
      else{
        this.SelectedMaterialList.push(item)
      }
    }
    else
    {
      let index = this.SelectedMaterialList.indexOf(item)
      this.SelectedMaterialList.splice(index,1)
    }
  }

  onSubmit() {
    this.materialList.emit(this.SelectedMaterialList)
  }

}
