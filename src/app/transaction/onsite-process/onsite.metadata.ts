export class Onsite {
    repairId: string;
    serviceNotificationNumber: string;
    coverageStatusCode: string;
    coverageStatusDescription: string;
    repairCreatedOnDate: string;
    repairType: string;
    repairTypeDescription: string;
    repairStatus: string;
    repairStatusDescription: string;
    device: Device;
    account: Account;
    customer: Customer;
    componentIssues: ComponentIssue[];
    notes: Note[];
    coverageOption: string;
    technicianId: string;
    price: Price;
    coverageOptionDescription: string;
    loanerStockUnavailable: boolean;
    boxRequired: boolean;
    technicianName: string;
    acPlusCoverage: string;
    acPlusCoverageDescription: string;
    lastModifiedDate: string;
  }
  
  export class Device {
    identifiers: Identifiers;
    configuration: Configuration;
    productName: string;
    configDescription: string;
    configCode: string;
    warrantyInfo: WarrantyInfo; 
    soldToName: string; 
    productDescription: string;
    productImageURL: string;
  }
  
  export class WarrantyInfo {
    purchaseDate: string;
    warrantyStatusCode: string;
    warrantyStatusDescription: string;
    coverageEndDate: string;
    onsiteCoverage: boolean;
    laborCovered: boolean;
    partCovered: boolean;
    purchaseCountryDesc: string;
    purchaseCountryCode: string;
    deviceCoverageDetails: string;
  }
  
  export class Identifiers {
    serial: string;
    imei: string;
    meid: string;
  }
  
  export class Configuration {
    hardDiskSize: string;
    osVersion: string;
    ramSize: string;
  }
  
  export class Account {
    assignedShipTo: string;
    assignedPartnerName: string;
    assignedPartnerAddress: PartnerAddress;
    soldToContactPhone: string;
  }
  
  export class PartnerAddress {
    line2: string;
    street: string;
    city: string;
    county: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    countryName: string;
    stateName: string;
  }
  
  export class Customer {
    zone: string;
    firstName: string;
    lastName: string;
    companyName: string;
    emailAddress: string;
    primaryPhone: string;
    secondaryContact: string;
    secondaryPhone: string;
    address: Address[];
    type: string;
    customerTypeDescription: string;
    sendSMSOnPrimaryPhone: boolean;
  }
  
  export class Address {
    line1: string;
    line2: string;
    line3: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    countryName: string;
    stateName: string;
  }
  
  export class ComponentIssue {
    componentCode: string;
    issueCode: string;
    order: number;
    priority: number;
    type: string;
    componentDescription: string;
    issueDescription: string;
    reproducibility: string;
    reproducibilityDescription: string;
  }
  
  export class Note {
    content: string;
    type: string;
    addedBy: string;
    noteTimeStamp: string;
  }
  
  export class Price {
    currency: string;
    totalAmount: string;
    tax: string;
    subTotalAmount: string;
  }
  