export class RepairMetaData{
    RepairGuid:String;
    RepairCode:String;
    CaseGuid:String;
    RepairDate:Date;
    BaseAmount:Number;
    Discount:Number
    TaxAmount:Number;
    NetAmount:Number;
    Remark:String;
    Currency:String;
    coverageOption:String;
    reproducibility:string
    component:string
    issues:string
    RepairStatus:String;
    RepairDetail:RepairItem[];
}

export class RepairItems{
    RepairDetailGuid:String;
    ItemType:String;
    ItemNo:Number;
    ItemCode:String;
    ItemDescrption:String;
    SAC_HSNCode:String;
    Quantity:Number;
}


export class Repair{
    RepairGuid:String;
    RepairCode:String;
    CaseGuid:String;
    RepairDate:Date;
    BaseAmount:number;
    Discount:number
    TaxAmount:number;
    NetAmount:number;
    Remark:String;
    Currency:String;
    RepairStatus:String;
    RepairDetail:RepairItem[];
}

export class RepairItem{
    RepairDetailGuid:String;
    ImageUrl:String;
    ItemType:String;
    Type:String;
    ItemNo:number;
    ItemCode:String;
    ItemDescription:String;
    Warranty:String;
    WarrantyDescription:String;
    Coverage:String
    CoverageDescription:String
    ComponentCode:String;
    ComponentDescription:String;
    IssueCode:String;
    IssueDescription:String;
    ExchangePrice:number;
    StockPrice:number;
    Margin:number
    GSTGroupCode:String;
    SAC_HSNCode:String;
    Quantity:number;
    PriceType:String;
    UnitPrice:number;
    BaseAmount:number;
    DiscountPercentage:number;
    HeaderDiscountAmount:number;
    DiscountAmount:number;
    TaxableAmount:number;
    TaxPercentage:number;
    TaxAmount:number;
    NetAmount:number;
    Currency:String;
    GSTJuridictionType:String;
}

