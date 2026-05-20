export class Quote{
    QuoteGuid:String;
    QuoteCode:String;
    CaseGuid:String;
    QuoteDate:Date;
    BaseAmount:number;
    Discount:number
    TaxAmount:number;
    TaxableAmount: number;
    NetAmount:number;
    Remark:String;
    Currency:String;
    QuoteStatus:String;
    QuoteDetail: QuoteItem[];
}

export class QuoteItem{
    QuotationDetailGuid:String;
    ImageUrl:String;
    ItemType:String;
    Type:String;
    ItemNo:number;
    ItemCode:string;
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
    DiscountCouponCode: string;
    TaxableAmount:number;
    TaxPercentage:number;
    TaxAmount:number;
    NetAmount:number;
    Currency:String;
    GSTJuridiction:String;
    PricingOptions:any[];
    GSTPercentage:number;
    GSTComponentDetails:any;
    CGSTPercentage: number ;
    SGSTPercentage: number;
    IGSTPercentage: number;
    CGSTAmount: number;
    SGSTAmount: number;
    IGSTAmount: number;
    isDeleted:boolean;
    rowno:number;
    PriceRangeApplicable: boolean;
    PriceRangeStart: number;
    PriceRangeEnd : number;

     IsContractApplicable:boolean;
    ContractCode:any;
    ContractStartDate:any;
    ContractEndDate:any;
        PartType:any;

}
