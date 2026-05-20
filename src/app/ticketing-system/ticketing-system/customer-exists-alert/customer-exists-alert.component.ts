import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmCustomerMappingComponent } from '../confirm-customer-mapping/confirm-customer-mapping.component';

@Component({
  selector: 'app-customer-exists-alert',
  templateUrl: './customer-exists-alert.component.html',
  styleUrls: ['./customer-exists-alert.component.css']
})
export class CustomerExistsAlertComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: any; ticket: any },
    private dialogRef: MatDialogRef<CustomerExistsAlertComponent>,
    private dialog: MatDialog
  ) { }

  onMapExisting() {
    const confirmRef = this.dialog.open(ConfirmCustomerMappingComponent, {
      width: '460px',
      disableClose: true,
      data: {
        customer: this.data.customer,
        ticket: this.data.ticket
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result === 'mapped') {
        this.dialogRef.close({ action: 'mapped', CustomerCode: this.data.customer.CustomerCode });
      }
    });
  }

  closePopUp() {
    this.dialogRef.close(null);
  }

  onAddNew() {
    this.dialogRef.close({ action: 'add_new' });
  }
}