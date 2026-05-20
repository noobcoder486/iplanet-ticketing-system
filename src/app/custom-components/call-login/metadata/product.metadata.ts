import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class Product {

  productForm: FormGroup;
  isSerialNumberAvailable: Boolean;
  serialNo: String;
  materialCode: String;
  MaterialDesc: String;
  Symptoms: any;
  itemReceivable: any[];
  faultDescription: String;
  remark: String;
  warrantyStatus: any;
  ELSStatus: any;
  PurchaseInvoice: any;
  POPDate: any;
  WarrantyStartDate: any;
  WarrantyEndDate: any;


  constructor(isSerial: boolean) {
    this.isSerialNumberAvailable = isSerial;
  }
}
