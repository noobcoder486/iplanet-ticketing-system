import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-part-selector',
  templateUrl: './part-selector.component.html',
  styleUrls: ['./part-selector.component.css']
})
export class PartSelectorComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  toastr: any;
  validateAllFormFields: any;
  partList: any[]= [];
  resourceData: any[]=[]
  SelectedPartList: any[] = []; 
  SelectedPartCount:Number=0;
  searchText: String = "";
  showonlyselected:boolean=false;
  close: boolean = false;
  productCategory: any;
  partSelectorForm: FormGroup
  productName: any;
  ProductCategory: DropDownValue = this.getBlankObject();
  ProductName: DropDownValue = this.getBlankObject();
  @Output() partSelector  = new EventEmitter<any>();
  @Output() closePartSelector  = new EventEmitter<any>();
  @Output() productCategoryBy  = new EventEmitter<any>();


  

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private toast: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
  )
  { }

  ngOnInit() {
      this.onProductCategory({ term: '', items: [] });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

   onSubmit() {
    this.SelectedPartList=[];
    for(let item of this.partList) {
      if(item.selected == true) {
        let retvalue = this.partList.filter(partNumber=>partNumber.toString() == item.partNumber.toString());
        this.SelectedPartList.push(item);
      }
    }
    
    this.partSelector.emit(this.SelectedPartList);
    this.productCategoryBy.emit(this.productCategory)
    console.log("ProductCategory in PART SELECTOR", this.productCategory)
    this.closePartSelector.emit(this.close);
  }

UpdateSelectedCount(){
   ;
  this.SelectedPartCount= this.partList.filter(x => x.selected == true).length;
}

getPartSummaryData() {
   
  this.ngxSpinnerService.show()
  var objData = {"productName": this.productName}
  console.log(this.productName)
  var strRequestData = JSON.stringify(objData);
    var data = {
      "Content":strRequestData
    };
    
  
    this.gsxService.getStockingPartsSummary(data).subscribe({
      next: (value) => {
         ;
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
           ;
          var errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
          {
              errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
              this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
        }
        else
        {
 
          this.partList =this.sortArrayOfObjects(response,"selected","ascending");
          for(let item of this.partList)
          {
            item.ProductCategory = this.productCategory
          }
          console.log(this.partList,"this.partList")
        }
      },
      error:(err) => {
        console.log(err);
        this.toast.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()

      }
    });
  }



  onSearchChange(text) {
    console.log(text);
    for(let item of this.partList) {
      if(text.length > 1){
        item.inSearch = (item.description.toLowerCase().includes(text.toLowerCase()) || item.partNumber.toLowerCase().includes(text.toLowerCase()));
      }else{
        item.inSearch = false;
      }
    }
  }


  sortArrayOfObjects = <T>(
    data: T[],
    keyToSort: keyof T,
    direction: 'ascending' | 'descending' | 'none',
  ) => {
    if (direction === 'none') {
      return data
    }
    const compare = (objectA: T, objectB: T) => {
      const valueA = objectA[keyToSort]
      const valueB = objectB[keyToSort]
      
      if (valueA === valueB) {
        
        return 0
      }
  
      if (valueA > valueB) {
        return direction === 'ascending' ? 1 : -1
      } else {
        return direction === 'ascending' ? -1 : 1
      }
    }
  
    return data.slice().sort(compare)
  }



  isToShowTr(item): Boolean {
    if(this.showonlyselected==false)
    {
        if(this.searchText.length <= 1){
          return true;
        }else if(item.selected == true){
          return true;
        } else if (item.inSearch) {
          return true;
        } else{
          return false;
        }
    }
    else
    {
      if(item.selected == true)
      {
        return true;
      } else{
        return false;
      }

    }
  }

  onProductCategory($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductCategory, $event.term, {
  
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductCategory = value;
          this.onProductName({ term: "", items:[]})
        }
      },
      error: (err) => {
        this.ProductCategory = this.getBlankObject();
      }
    })
  }
  
  onProductName($event: { term: String, items: any[] }) {
    console.log(this.productCategory)
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductName, $event.term==undefined?"":$event.term, {
      ProductCategory: this.productCategory
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductName = value;
        }
      },
      error: (err) => {
        this.ProductName = this.getBlankObject();
      }
    })
  }
}
