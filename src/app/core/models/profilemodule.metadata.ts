export class ProfileModuleMetaData {
    ModuleId: number;
    ModuleName: string;
    ProfileId: number;
    View?: boolean;
    Create: boolean;
    Edit?: boolean;
    Delete?: boolean;
    Import?: boolean;
    Export?: boolean;
}

export class AddEditProfileModuleMetaData {
    ProfileId: number;
    ProfileName: string;
    Description: string;
    ProfileModuleList: ProfileModuleMetaData[];
}

export class ProfileListMetaData {
    ProfileId: number;
    ProfileName: string;
    ProfileDescription: string;
}

export class ModuleFieldMetaData {
    ModuleId: number;
    EntityId: number;
    fieldId: number;
    FieldName: string;
    FieldType: string;
    FieldLabel: string;
    isAutoincrement?: boolean;
    isPK?: boolean;
    MinSize?: number;
    MaxSize?: number;
    DecimalSize: number;
    ishidden?: boolean;
    IsNull?: boolean;
    DefaultValue: string;
    isMendatory: boolean;
    Sequence: number;
    Section: string;
    isOrgRole?: boolean;
}

export class AddAdminUserMetaData {
    UserName: string;
    PrimaryEmail: string;
    FirstName: string;
    LastName: string;
    Password: string;
    UserRole: string;
    TimeZoneId: number;
    CreatedBy: string;
    LastUpdatedBy: string;
  }

export class UserRegistrationMetaData extends AddAdminUserMetaData {
  Title: string;
  Fax: string;
  Department: string;
  OtherEmail: string;
  OfficePhone: string;
  SecondaryEmail: string;
  MobilePhone: string;
  ReportedTo: string;
  HomePhone: string;
  SecondaryPhone: string;
  Signature: string;
  LanguageCode: string;
  CRMPhoneExtension: string;
  DefaultLandingPage: string;
}

export class AddUserMetaData {
    UserName: string;
    IsAdmin: boolean;
    FirstName: string;
    LastName: string;
    Password: string;
    Email1: string;
    Status: string;
    HourFormat: string;
    EndHour: string;
    StartHour: string;
    Title: string;
    WorkPhone: string;
    Department: string;
    MobilePhone: string;
    JobRoleId: number;
    orgRoleId: number;
    ReportsToUserName: string;
    OtherPhone: string;
    Email2: string;
    PhoneFax: string;
    SecondaryEmail: string;
    HomePhone: string;
    DateFormat: string;
    Signature: string;
    Description: string;
    AddressStreet: string;
    AddressCity: string;
    AddressStateCode: string;
    AddressPostalCode: string;
    AddressCountry: string;
    AuthKey: string;
    TimeZoneId: number;
    CurrencyCode: string;
    currency_grouping_pattern: string;
    currency_decimal_separator: string;
    currency_grouping_separator: string;
    currency_symbol_placement: string;
    ImageName: string;
    InternalMailComposer: boolean;
    Theme: string;
    LanguageCode: string;
    CrmPhoneExtension: string;
    CreatedBy: string;
    CreatedDate?: Date;
    LastUpdatedBy: string;
    LastUpdatedDate?: Date;
    IsEdit?: boolean;
  }