import { FormGroup } from "@angular/forms";

export class GSTSetup {
    gstSetup: FormGroup;
    gstGUID: String;
    countryCode: string;
    gstStateCode: string;
    gstGroupCode: String;
    gstJuridictionCode: String;
    effectiveDate: String;
    calculationOrder: String;
    gstComponentCode: String;
    gstPercentage: String;
  }