import { Component, OnInit,Inject } from '@angular/core'; 
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
// import * as glob from "/../../config/global";
import * as glob from "src/app/config/global"
import { Router } from '@angular/router';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-refund-popup',
  templateUrl: './refund-popup.component.html',
  styleUrls: ['./refund-popup.component.css']
})
export class RefundPopupComponent implements OnInit {

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RefundPopupComponent>,
    private route: Router,
    private dropdownService: DropdownDataService,
    private toastr: ToastrService,
  )
  {   }
   LocationCode :any;
   CustomerCode :any;
   DocType :any;
   RefundTypeDD : DropDownValue = DropDownValue.getBlankObject();
  
  ngOnInit(): void {
    this.LocationCode=this.data.LocationCode;
    this.CustomerCode=this.data.CustomerCode;
    // this.DocType=this.data.DocType;

  }

  optionClicked( optionClicked )
  {
    if (optionClicked == 'Repair'){
      this.DocType = 'RREFUND'
      this.onRefundTypeSearch({ term: "", item: [] });      
    }
    else if (optionClicked == 'SalesReturn'){
      this.DocType = 'SREFUND'
      this.onRefundTypeSearch( {term: "", item: [] });
    }
    this.dialogRef.close();
  }

  
  // GetRepairOrSalesReturn DropDown 
  onRefundTypeSearch( $event: { term: string; item: any[] } ){
    
    this.dropdownService.fetchDropDownData(DropDownType.RefundType,$event.term , {
      LocationCode: this.LocationCode,
      CustomerCode: this.CustomerCode,
      DocType: this.DocType
    }).subscribe({
      next: (value) => {

        if (value != null) {
          // this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.RefundTypeDD = value;
          console.log("results from Bind Refund:- ", value)
          if ( value?.Data.length  < 1){
              this.toastr.error("No Payment/s Found, choose another option...")
              return
          }
          console.log("Value ", value?.Data[0]?.InvoiceGuid)
          this.DocType == 'RREFUND' ? 
            this.route.navigate(['/auth/' + glob.getCompanyCode() + '/refund-order-request'], { queryParams: { locationcode: this.LocationCode, customercode: this.CustomerCode, docType: this.DocType} })
              : this.route.navigate(['/auth/' + glob.getCompanyCode() + '/sales-return-request'],{ queryParams: { locationcode: this.LocationCode, customercode: this.CustomerCode, invoiceguid: value?.Data[0]?.InvoiceGuid} })
          
          console.log("Refund Type Code  :- ", this.RefundTypeDD);
        }
      },
      error: (err) => {
        console.log(" Error while finding Payments:- ", err)
      }
    });
  }
}

  
  
