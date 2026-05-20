import { Component, OnInit,Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';


@Component({
  selector: 'app-reject-note',
  templateUrl: './reject-note.component.html',
  styleUrls: ['./reject-note.component.sass']
})
export class RejectNoteComponent implements OnInit {

  Rejection : FormGroup
  @Output() RejectRepair  = new EventEmitter<any>();
  // Decline 
  DeclareRepair: any;
  isRejectClicked = false 
  DeclineRepairListDD: DropDownValue = DropDownValue.getBlankObject();

  constructor(
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
   
  ) { }

  ngOnInit(): void {
    this.onDeclineRepair({ term: "", item: [] });
    this.Rejection = this.formBuilder.group({
      notes: [null, Validators.required],
    });
  }

  RejectRepairSubmit()
  {
    '';

    var RejectionReason = this.Rejection.controls["notes"].value
    let index = this.DeclineRepairListDD.Data.findIndex(d => d.Id == this.DeclareRepair)
    let text = this.DeclineRepairListDD.Data[index].TEXT
    RejectionReason += '\nReason: ' + text;
    console.log("Reason ", RejectionReason)

    if(RejectionReason == "" || RejectionReason==undefined || RejectionReason==null)
    {
      this.toaster.error('Please eneter Rejection reason')
      return;
    }
    this.RejectRepair.emit({notes:RejectionReason,submit:true})
  }

  onDeclineRepair($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DeclineRepair, $event.term, {
    }).subscribe({
      next: (value) => {
        console.log("Reason ", value)
        if (value != null) {
          this.DeclineRepairListDD = value;
        }
      },
      error: (err) => {
        this.DeclineRepairListDD = DropDownValue.getBlankObject();
      }
    });
  }

}
