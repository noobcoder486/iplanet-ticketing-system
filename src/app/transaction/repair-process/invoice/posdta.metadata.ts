export interface ISourcedocumentlink {
    key: string;
    logicalsystem: string;
    type: string;
}

export interface Importparameters {
    i_commit: string;
    i_lockwait: string;
    i_sourcedocumentlink: ISourcedocumentlink;
}

export interface Additional {
    businessdaydate: string;
    keyedofflineflag: string;
    retailstoreid: string;
    trainingflag: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    transreasoncode: string;
    workstationid: string;
}

export interface Creditcard {
    adjudicationcode: string;
    authorizationcode: string;
    authorizationdatetime: string;
    authorizationmethodcode: string;
    authorizingtermid: string;
    blacklistdate: string;
    blacklistversion: string;
    businessdaydate: string;
    cardexpirationdate: string;
    cardguid: string;
    cardholdername: string;
    cardnumber: string;
    cardnumbersuffix: string;
    cardnumberswipedorkeyedcode: string;
    cardtype: string;
    enctype: string;
    forceonline: string;
    hostauthorized: string;
    limitamount: string;
    mediaissuerid: string;
    paymentcard: string;
    providerid: string;
    reactioncode: string;
    requestedamount: string;
    retailstoreid: string;
    tendersequencenumber: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    validfromdate: string;
    workstationid: string;
}

export interface Customerdetail {
    businessdaydate: string;
    customerdetailssequencenumber: string;
    customerinformationtypecode: string;
    dataelementid: string;
    dataelementvalue: string;
    retailstoreid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Directdebit {
    accountholdername: string;
    bankaccount: string;
    bankcode: string;
    businessdaydate: string;
    cardguid: string;
    ecseperator: string;
    enctype: string;
    industrymainkey: string;
    retailstoreid: string;
    tendersequencenumber: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Lineitemdiscount {
    bonusbuyid: string;
    businessdaydate: string;
    discountid: string;
    discountid_long: string;
    discountidqualifier: string;
    discountreasoncode: string;
    discountsequencenumber: string;
    discounttypecode: string;
    offerid: string;
    reductionamount: string;
    retailsequencenumber: string;
    retailstoreid: string;
    storefinancialledgeraccountid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Lineitemext {
    businessdaydate: string;
    fieldgroup: string;
    fieldname: string;
    fieldvalue: string;
    retailsequencenumber: string;
    retailstoreid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Lineitemtax {
    businessdaydate: string;
    retailsequencenumber: string;
    retailstoreid: string;
    taxamount: string;
    taxsequencenumber: string;
    taxtypecode: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Retaillineitem {
    actualunitprice: string;
    batchid: string;
    businessdaydate: string;
    cost: string;
    enteredean: string;
    itemid: string;
    itemid_LONG: string;
    itemidentrymethodcode: string;
    itemidqualifier: string;
    logsys: string;
    nonexistentarticleid: string;
    nonexistentarticleid_LONG: string;
    nonexistentean: string;
    normalsalesamount: string;
    order_CHANNEL: string;
    origbegintimestamp: string;
    origbusinessdaydate: string;
    origlineitemnumber: string;
    origreasoncode: string;
    origretailstoreid: string;
    origtransnumber: string;
    origworkstationid: string;
    pricetypecode: string;
    promotionid: string;
    retailquantity: string;
    retailreasoncode: string;
    retailsequencenumber: string;
    retailstoreid: string;
    retailtypecode: string;
    salesamount: string;
    salesunitofmeasure: string;
    salesunitofmeasure_iso: string;
    scantime: string;
    serialnumber: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    units: string;
    workstationid: string;
}

export interface Tender {
    accountnumber: string;
    businessdaydate: string;
    referenceid: string;
    retailstoreid: string;
    tenderamount: string;
    tendercurrency: string;
    tendercurrency_iso: string;
    tenderid: string;
    tendersequencenumber: string;
    tendertypecode: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Tenderext {
    businessdaydate: string;
    fieldgroup: string;
    fieldname: string;
    fieldvalue: string;
    retailstoreid: string;
    tendersequencenumber: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Transaction {
    activitytime: string;
    begindatetimestamp: string;
    businessdaydate: string;
    customerage: string;
    customerentrymethod: string;
    customeridpos: string;
    department: string;
    enddatetimestamp: string;
    logsys: string;
    operatorid: string;
    operatorqualifier: string;
    origbegintimestamp: string;
    origbusinessdaydate: string;
    origlineitemnumber: string;
    origreasoncode: string;
    origretailstoreid: string;
    origtransnumber: string;
    origworkstationid: string;
    partnerid: string;
    partnerqualifier: string;
    pausetime: string;
    registertime: string;
    retailstoreid: string;
    tendertime: string;
    tillid: string;
    trainingtime: string;
    transactioncurrency: string;
    transactioncurrency_iso: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Transactiondiscount {
    bonusbuyid: string;
    businessdaydate: string;
    discountid: string;
    discountid_long: string;
    discountidqualifier: string;
    discountreasoncode: string;
    discountsequencenumber: string;
    discounttypecode: string;
    offerid: string;
    reductionamount: string;
    retailstoreid: string;
    storefinancialledgeraccountid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Transactionext {
    businessdaydate: string;
    fieldgroup: string;
    fieldname: string;
    fieldvalue: string;
    retailstoreid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Transactionloyalty {
    businessdaydate: string;
    cardguid: string;
    customercardholdername: string;
    customercardnumber: string;
    customercardtype: string;
    customercardvalidfrom: string;
    customercardvalidto: string;
    eligibleamount: string;
    eligiblequantity: string;
    eligiblequantityuom: string;
    eligiblequantityuom_iso: string;
    enctype: string;
    externalpromotionid: string;
    loyaltypointsawarded: string;
    loyaltypointsredeemed: string;
    loyaltypointstotal: string;
    loyaltyprogramid: string;
    loyaltysequencenumber: string;
    promotionid: string;
    rebatemethod: string;
    retailstoreid: string;
    transactionsequencenumber: string;
    transactiontypecode: string;
    workstationid: string;
}

export interface Requesttables {
    additionals: Additional[];
    creditcard: Creditcard[];
    customerdetails: Customerdetail[];
    directdebit: Directdebit[];
    lineitemdiscount: Lineitemdiscount[];
    lineitemext: Lineitemext[];
    lineitemtax: Lineitemtax[];
    retaillineitem: Retaillineitem[];
    tender: Tender[];
    tenderext: Tenderext[];
    transaction: Transaction[];
    transactiondiscount: Transactiondiscount[];
    transactionext: Transactionext[];
    transactionloyalty: Transactionloyalty[];
}

export interface POSDTA {
    importparameters: Importparameters;
    requesttables: Requesttables;
}


