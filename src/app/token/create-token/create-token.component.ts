import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as glob from "../../config/global";
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata'; 

import { TokenGenerationComponent } from '../token-generation/token-generation.component';
@Component({
  selector: 'app-create-token',
  templateUrl: './create-token.component.html',
  styleUrls: ['./create-token.component.css']
})
export class CreateTokenComponent implements OnInit {

  constructor( 
    public dialogRef: MatDialog,
    private router: Router,
    private dropdownDataService: DropdownDataService
    ) {
     
   }


   selectedLocationCode
   LocationForJob: DropDownValue = DropDownValue.getBlankObject();
   selectedCallForm

  display=false;
  Maindisplay=true;
  
  ngOnInit(): void {
    this.Maindisplay=true;
    this.selectedLocationCode = ''
    this.onLocationSearch({ term: "", item: [] });

  }

  generateToken(){
  this.router.navigate(['/auth/' + glob.getCompanyCode() + '/token-generate']);
  }

  popup()
  {
    this.Maindisplay=false;
    this.display = true;
     
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
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

}
