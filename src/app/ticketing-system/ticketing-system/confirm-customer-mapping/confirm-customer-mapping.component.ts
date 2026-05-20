import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-customer-mapping',
  templateUrl: './confirm-customer-mapping.component.html',
  styleUrls: ['./confirm-customer-mapping.component.css']
})
export class ConfirmCustomerMappingComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: any; ticket: any },
    private dialogRef: MatDialogRef<ConfirmCustomerMappingComponent>
  ) { }

  get fullName(): string {
    const fn = this.data.customer?.FirstName || '';
    const ln = this.data.customer?.LastName || '';
    return `${fn} ${ln}`.trim() || '—';
  }

  get address(): string {
    const parts = [
      this.data.customer?.Address1,
      this.data.customer?.Address2,
      this.data.customer?.Address3,
      this.data.customer?.City,
      this.data.customer?.StateCode,
      this.data.customer?.ZipCode,
      this.data.customer?.CountryCode
    ].filter(p => p && p.trim() !== '');
    return parts.join(', ') || '—';
  }

  get gstInfo(): string {
    const no = this.data.customer?.GSTRegistrationNo;
    const type = this.data.customer?.GSTRegistrationType;
    if (!no && !type) return '—';
    if (no && type) return `${no} (${type})`;
    return no || type;
  }

  onConfirm() {
    this.dialogRef.close('mapped');
  }

  onCancel() {
    this.dialogRef.close('back');
  }
}