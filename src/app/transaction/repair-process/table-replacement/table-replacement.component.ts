
import { Component, OnInit, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from 'src/app/config/global';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { CaseDetail } from '../repair-process.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from "xml2js";
import { v4 as uuidv4 } from 'uuid';
import { NgxSpinnerService } from 'ngx-spinner';




@Component({
  selector: 'app-table-replacement',
  templateUrl: './table-replacement.component.html',
  styleUrls: ['./table-replacement.component.css']
})
export class TableReplacementComponent implements OnInit, OnChanges {

  @Input() repa: CaseDetail;
  @Input() CompanyStockList: any[] = [];
  @Input() ReplenishList: any[] = [];




  MaterialCode: any
  FinalCompanyStockList: any = [];

  ReplenishStockList: any = [];
  FinalReplenishStockList: any = [];





  R_MaterialCode: any;
  R_MaterialDescription: any;
  R_SerialNo: any;
  R_ReplenishList: any = [];

  isReplenishAllowed: boolean = false;

  BindCompanyStockDD: DropDownValue = DropDownValue.getBlankObject();
  errorMessage: any;

  isShowReplenish: boolean = false;


  constructor(
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,


  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes["repa"]) {


      if (Array.isArray(this.repa?.TableReplacementStock?.Data)) {
        this.FinalCompanyStockList = [...this.repa?.TableReplacementStock?.Data];
      } else if (this.repa?.TableReplacementStock?.Data) {
        this.FinalCompanyStockList = [this.repa.TableReplacementStock?.Data];
      }

      if (Array.isArray(this.repa?.TableReplacementReplenish?.Data)) {
        this.R_ReplenishList = [...this.repa?.TableReplacementReplenish?.Data];
      } else if (this.repa?.TableReplacementReplenish?.Data) {
        this.R_ReplenishList = [this.repa?.TableReplacementReplenish?.Data];
      }
      // if (Array.isArray(this.repa?.TableReplacementReplenish?.Data)) {
      //   this.FinalReplenishStockList = [...this.repa?.TableReplacementReplenish?.Data];
      // } else if (this.repa?.TableReplacementReplenish?.Data) {
      //   this.FinalReplenishStockList = [this.repa?.TableReplacementReplenish?.Data];
      // }

     



      if (this.FinalCompanyStockList.length > 0) {
        this.isShowReplenish = true
      }
    }

    if (changes["CompanyStockList"]) {
      console.log('CompanyStockList', this.CompanyStockList);

      let CompanyStockList = Array.isArray(this.CompanyStockList) ? this.CompanyStockList : [this.CompanyStockList]

      if (CompanyStockList) {
        for (let item of CompanyStockList) {
          this.FinalCompanyStockList.push({
            TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
            MaterialCode: item.MaterialCode,
            MaterialDescription: item.MaterialDescription,
            SerialNo: item.SerialNo,
            IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted
          })
        }
      }




      // this.FinalCompanyStockList = [...this.CompanyStockList];
    }

    // if (changes["ReplenishList"]) {


    //   let ReplenishStockList = Array.isArray(this.ReplenishList) ? this.ReplenishList : [this.ReplenishList]

    //   if (ReplenishStockList) {
    //     for (let item of ReplenishStockList) {
    //       this.FinalReplenishStockList.push({
    //         TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
    //         MaterialCode: item.MaterialCode,
    //         MaterialDescription: item.MaterialDescription,
    //         SerialNo: item.SerialNo,
    //         IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted
    //       })
    //     }
    //   }



    // }
    if (changes["ReplenishList"]) {


      let ReplenishStockList = Array.isArray(this.ReplenishList) ? this.ReplenishList : [this.ReplenishList]

      if (ReplenishStockList) {
        for (let item of ReplenishStockList) {
          this.R_ReplenishList.push({
            TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
            MaterialCode: item.MaterialCode,
            MaterialDescription: item.MaterialDescription,
            SerialNo: item.SerialNo,
            IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted

          })
        }
      }




    }

  }



  ngOnInit(): void {


    console.log('TableReplacementComponent called ')
    this.onBindCompanyStock({ term: "", item: [] })

  }

  onBindCompanyStock($event: { term: string; item: any[] }) {
    
    console.log('glob.getCompanyCode().toString()', glob.getCompanyCode().toString())
    this.dropdownDataService.fetchDropDownData(DropDownType.BindCompanyStock, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      LocationCode: this.repa?.LocationCode
    }).subscribe({
      next: (value) => {
        
        if (value != null) {
          this.BindCompanyStockDD = value;
          console.log("BindCompanyStockDD ", this.BindCompanyStockDD)
        }
      },
      error: (err) => {
        this.BindCompanyStockDD = DropDownValue.getBlankObject();
        console.log("no data found BindCompanyStockDD")

      }
    });
  }


  addReplenish() {

  }


  deleteReplenishSerialNo(item) {

  }





  onSubmit(type) {

    this.ngxSpinnerService.show()

    if (type == "STOCK" && this.FinalCompanyStockList.length <= 0) {
      this.toaster.error('Please Select atleast one stock  item to proceed !! ')
      this.ngxSpinnerService.hide()

      return
    }

    // if (type == "REPLENISH" && this.FinalReplenishStockList.length <= 0) {
    //   this.toaster.error('Please Select atleast one Replenish item to proceed !! ')
    //   this.ngxSpinnerService.hide()

    //   return
    // }


    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "SaveTableReplacement",
    });
    requestData.push({
      Key: "CaseGuid",
      Value: this.repa?.CaseGUID,
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.repa?.LocationCode
    });

    requestData.push({
      Key: "Type",
      Value: type
    });

    requestData.push({
      Key: "Data",
      Value: this.StockIntoXML()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };



    
    console.log("SaveTableReplacement ", contentRequest)
    

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        

        let response = JSON.parse(value.toString());

        if (response.ReturnCode == "0") {
          var data = JSON.parse(response.ExtraData);
          this.toaster.success("Submitted Succesfully");

          window.location.reload()
        }
        else {
          this.ngxSpinnerService.hide()

          console.log("Error Response: ", response)
          let errorMessage = response.ErrorMessage;
          this.toaster.error(errorMessage);
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(errorMessage, (error, result) => {
            const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
            console.log("Messages : ", errorMessages)
            errorMessages.forEach((errorMessage) => {
              console.log("Error Message: ", error)
              this.toaster.error(errorMessage.ERRORMESSAGE);
            });
          });

          this.ngxSpinnerService.hide()

        }
      },
      error: (err) => {

        console.log(err);
        this.ngxSpinnerService.hide()

      },
    });
  }



  onReplenishSubmit(type) {

    if (this.R_ReplenishList.length == 0) {
      this.toaster.error('ReplenishList cannot be empty')
    }

    this.ngxSpinnerService.show()

    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "SaveTableReplacement",
    });
    requestData.push({
      Key: "CaseGuid",
      Value: this.repa?.CaseGUID,
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.repa?.LocationCode
    });

    requestData.push({
      Key: "Type",
      Value: type
    });

    requestData.push({
      Key: "Data",
      Value: this.ReplenishXML()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    console.log("SaveReplenishTableReplacement ", contentRequest)

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        

        let response = JSON.parse(value.toString());

        if (response.ReturnCode == "0") {
          var data = JSON.parse(response.ExtraData);
          this.toaster.success("Submitted Succesfully");

          window.location.reload()
        }
        else if (response.ReturnCode == "1") {
          
          this.toaster.error(`${response.ErrorMessage}`)
          this.ngxSpinnerService.hide()

          // window.location.reload()
        }
        else {
          console.log("Messages : ", response)
          this.ngxSpinnerService.hide()

          console.log("Error Response: ", response)
          let errorMessage = response.ErrorMessage;
          this.toaster.error(errorMessage);
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(errorMessage, (error, result) => {
            const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
            console.log("Messages : ", errorMessages)
            errorMessages.forEach((errorMessage) => {
              console.log("Error Message: ", error)
              this.toaster.error(errorMessage.ERRORMESSAGE);
            });
          });


          this.ngxSpinnerService.hide()

        }
      },
      error: (err) => {

        console.log(err);
        this.ngxSpinnerService.hide()

      },
    });
  }



  StockIntoXML() {
    let rawData = {
      rows: [],
    };
    console.log("stock ", this.FinalCompanyStockList)
    for (let item of this.FinalCompanyStockList) {
      
      rawData.rows.push({
        row: {
          TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
          MaterialCode: item.MaterialCode,
          MaterialDescription: item.MaterialDescription,
          SerialNo: item.SerialNo,
          IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted,
          IsSerialized: item.SerialNo == null || item.SerialNo == undefined || item.SerialNo == '' ? "0" : "1"

        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
    console.log("xml ", xml)
    return xml;
  }



  // ReplenishIntoXML() {
  //   let rawData = {
  //     rows: [],
  //   };
  //   console.log("stock ", this.FinalReplenishStockList)
  //   for (let item of this.FinalReplenishStockList) {

  //     rawData.rows.push({

  //       row: {

  //         TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
  //         MaterialCode: item.MaterialCode,
  //         MaterialDescription: item.MaterialDescription,
  //         SerialNo: item.SerialNo,
  //         IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted


  //       },
  //     });
  //   }
  //   var builder = new xml2js.Builder();
  //   var xml = builder.buildObject(rawData);
  //   xml = xml
  //     .toString()
  //     .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //   xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
  //   console.log("xml ", xml)
  //   return xml;
  // }


  ReplenishXML() {
    let rawData = {
      rows: [],
    };
    console.log("stock ", this.R_ReplenishList)

    for (let item of this.R_ReplenishList) {

      rawData.rows.push({

        row: {
          TableReplacementDetailGUID: item.TableReplacementDetailGUID == null || item.TableReplacementDetailGUID == undefined ? uuidv4() : item.TableReplacementDetailGUID,
          MaterialCode: item.MaterialCode,
          MaterialDescription: item.MaterialDescription,
          SerialNo: item.SerialNo,
          IsDeleted: item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted,
          IsSerialized: item.SerialNo == null || item.SerialNo == undefined || item.SerialNo == '' ? "0" : "1"


        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
    console.log("xml ", xml)
    return xml;
  }


  deleteFromFCSL(item) {
    
    console.log('before  item.IsDeleted', item.IsDeleted)

      const data = this.repa?.TableReplacementStock?.Data;
      const SavedTableReplacementStock = Array.isArray(data) ? data : data ? [data] : []; 
      
    
      const isExists = SavedTableReplacementStock?.some(x => x.MaterialCode === item.MaterialCode);

    if (isExists) {
      item.IsDeleted = item.IsDeleted == "0" ? "1" : "0"
    }

    
    else {
      let index = this.FinalCompanyStockList.indexOf(item)
      this.FinalCompanyStockList.splice(index, 1)
    }
    console.log('after  item.IsDeleted', item.IsDeleted)

  }

  deleteFromFRSL(item) {
    
       
      const data = this.repa?.TableReplacementReplenish?.Data;
      const SavedTableReplacementReplenish = Array.isArray(data) ? data : data ? [data] : []; 

      const isExists = SavedTableReplacementReplenish.some(x => x.MaterialCode === item.MaterialCode);


    if (isExists) {
      item.IsDeleted = item.IsDeleted == 0 ? 1 : 0
    }
    else {
      let index = this.R_ReplenishList.indexOf(item)
      this.R_ReplenishList.splice(index, 1)
    }


  }

  // AddInReplenish() {

  //   this.R_ReplenishList.push({
  //     "TableReplacementDetailGUID": uuidv4(),
  //     "MaterialCode": this.R_MaterialCode,
  //     "SerialNo": this.R_SerialNo,
  //     "MaterialDescription": "",
  //     "IsSerialized": this.R_SerialNo == null || this.R_SerialNo == undefined || this.R_SerialNo == '' ? "0" : "1"

  //   })

  //   this.R_MaterialCode = null;
  //   this.R_SerialNo = null;

  //   console.log(' this.R_ReplenishList', this.R_ReplenishList);
  // }



  ValidateMaterialCode() {
        
    if (this.R_MaterialCode == null || this.R_MaterialCode == undefined || this.R_MaterialCode == '') {
      this.toaster.error(' Material Code  cannot be empty!')
      return
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "ValidateMaterialCode"
    });

    requestData.push({
      "Key": "MaterialCode",
      "Value": this.R_MaterialCode
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.ngxSpinnerService.show();
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var data = JSON.parse(response.ExtraData)

            if (data?.TotalRecords == '1') {
              
              // If Material Code is Serialised then Serial No Cannot be empty 
              if(data?.MaterialList?.SerializedModule == "1"){        
                   if(this.R_SerialNo == null || this.R_SerialNo == undefined || this.R_SerialNo == ''){
                     this.toaster.warning('Cannot Proceed without Serial No For  Serialized Material Codes');
                     this.R_MaterialCode = null;
                     this.R_SerialNo =null;
                     this.ngxSpinnerService.hide();

                     return
                   }
              }


              this.R_ReplenishList.push({
                "TableReplacementDetailGUID": uuidv4(),
                "MaterialCode": this.R_MaterialCode,
                "SerialNo": this.R_SerialNo,
                "MaterialDescription": data?.MaterialList?.MaterialDescription,
                "IsSerialized": this.R_SerialNo == null || this.R_SerialNo == undefined || this.R_SerialNo == '' ? "0" : "1",
                "IsDeleted": "0"


              })

              this.R_MaterialCode = null;
              this.R_SerialNo = null;

              console.log(' this.R_ReplenishList', this.R_ReplenishList);

            }
          
            this.ngxSpinnerService.hide();

          }
          else if (response.ReturnCode == '1') {
             this.R_MaterialCode = null;
              this.R_SerialNo = null;
            this.toaster.error(`${response.ErrorMessage}`)
            this.ngxSpinnerService.hide();

          }
          else {
            this.ngxSpinnerService.hide();



            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              console.log("response", response)
              this.toaster.error("")
            });
          }
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide();
          this.toaster.error(err.toString());
        }
      });


  }



}
