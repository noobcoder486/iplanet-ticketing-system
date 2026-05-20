import { Component, OnInit,Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';


@Component({
  selector: 'app-hold-note',
  templateUrl: './hold-note.component.html',
  styleUrls: ['./hold-note.component.sass']
})
export class HoldNoteComponent implements OnInit {

  Hold : FormGroup
  @Output() HoldRepair  = new EventEmitter<any>();
  // Decline 
  HoldRepairData: any;
  isRejectClicked = false 
  HoldRepairListDD: DropDownValue = DropDownValue.getBlankObject();

  constructor(
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
   
  ) { }

  ngOnInit(): void {
    this.onHoldRepair({ term: "", item: [] });
    this.Hold = this.formBuilder.group({
      notes: [null, Validators.required],
    });
  }

  HoldRepairSubmit()
  {
    '';

    var HoldReason = this.Hold.controls["notes"].value
    // console.log("Reason ", HoldReason)
    if(HoldReason == "" || HoldReason==undefined || HoldReason==null)
    {
      this.toaster.error('Please eneter Hold reason')
      return;
    }
    this.HoldRepair.emit({notes:HoldReason, holdType : this.HoldRepairData , submit:true})
  }

  onHoldRepair($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.HoldRepair, $event.term, {
    }).subscribe({
      next: (value) => {
        console.log("Reason ", value)
        if (value != null) {
          this.HoldRepairListDD = value;
        }
      },
      error: (err) => {
        this.HoldRepairListDD = DropDownValue.getBlankObject();
      }
    });
  }

}
