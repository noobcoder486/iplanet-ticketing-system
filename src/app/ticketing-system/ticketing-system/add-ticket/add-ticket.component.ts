import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.css']
})
export class AddTicketComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private route: Router,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  addTicketForm: FormGroup
  formTitle: string = "Create"
  params: any;
  isEdit: boolean = false;
  errorMessage: string;

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    this.addTicketForm = this.formBuilder.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerNo: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')]
      ],
      customerEmail: ['', [Validators.required, Validators.email]],

      ticketSubject: ['', [Validators.required, Validators.minLength(5)]],
      ticketDescription: ['', [Validators.required, Validators.minLength(10)]],

      ticketStatus: ['NEW'],
    });

  }

  controlValidations() {
    Object.keys(this.addTicketForm.controls).forEach(field => {
      let controlValue = this.addTicketForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  onCancel() {
    this.dialogRef.close();
  }
  
  onSubmit() {
    if (this.addTicketForm.invalid) {
      this.addTicketForm.markAllAsTouched();
      this.toastMessage.error('Please fill all required fields correctly.');
      return;
    }

    const formValue = this.addTicketForm.value;
    
    const requestData = [
      { Key: 'APIType', Value: 'CreateTicket' },
      { Key: 'CustomerName', Value: formValue.customerName },
      { Key: 'CustomerNo', Value: formValue.customerNo },
      { Key: 'CustomerEmail', Value: formValue.customerEmail },
      { Key: 'TicketStatus', Value: formValue.ticketStatus },
      { Key: 'TicketSubject', Value: formValue.ticketSubject },
      { Key: 'TicketDescription', Value: formValue.ticketDescription }
    ];

    const contentRequest = { content: JSON.stringify(requestData) };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        const response = JSON.parse(value.toString());

        if (response.ReturnCode === '0') {
          this.toastMessage.success('Ticket Created Successfully');
          this.dialogRef.close('saved');
        } else {
          // Parse XML error messages returned from SP
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.errorMessage, (err, result) => {
            if (!err) {
              response['errorMessageJson'] = result;
              this.handleError(response);  // your custom error handling
            } else {
              console.error('Error parsing XML:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Service Error:', err);
        this.toastMessage.error('Something went wrong while creating the ticket.');
      }
    });
  }

  getErrorMessage(control: string): string {
    let formControl = this.addTicketForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
