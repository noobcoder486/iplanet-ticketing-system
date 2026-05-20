import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import * as glob from 'src/app/config/global'
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.css']
})
export class MapLocationComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    public dialogRef: MatDialogRef<MapLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  LocationAccGroup: DropDownValue = this.getBlankObject();
  technicians: DropDownValue = DropDownValue.getBlankObject();
  locationCode: string = '';
  showAssignTechnician: boolean = false;
  selectedTechnicians: any;

  ngOnInit(): void {
    if (this.data.data?.LocationCode != null && this.data?.data.LocationCode
      != undefined && this.data?.data.LocationCode != '') {
      this.showAssignTechnician = true;
    }
    this.onLocationAccGroupCode({ term: '', items: [] })
    this.onTechnicianSearch({ term: "", item: null })
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onCancel() {
    let data = { success: false }
    this.dialogRef.close(data);
  }

  onSubmit() {
    let data = this.showAssignTechnician ?
      { success: true, techIds: this.selectedTechnicians } :
      { success: true, LocationCode: this.locationCode }
    this.dialogRef.close(data);
  }

  onLocationAccGroupCode($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationAccGroup = value;
        }
      },
      error: (err) => {
        this.LocationAccGroup = this.getBlankObject();
      }
    });
  }

  onTechnicianSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Technician, $event.term, {
      LocationCode: this.data?.data?.LocationCode
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.technicians = value;
        }
      },
      error: (err) => {
        this.technicians = DropDownValue.getBlankObject();
      }
    });
  }

}
