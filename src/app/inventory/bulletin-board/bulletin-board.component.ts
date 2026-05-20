import { Component, EventEmitter, OnInit, Output, } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import xml2js from "xml2js";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ACTIONENUM } from 'src/app/config/comman.const';

@Component({
  selector: 'app-bulletin-board',
  templateUrl: './bulletin-board.component.html',
  styleUrls: ['./bulletin-board.component.css']

})
export class BulletinBoardComponent implements OnInit {

  BulletinBoardList: any[] = [];
  filteredBulletinBoardList: any[] = [];
  toolBarAction: any[] = [];
  isBulletinPopup: boolean = false;
  BulletinObject: any;
  errorMessage: string;
  sortOrder: string;
  remark: string;
  params: any;
  isApproverPermission = false


  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,

  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.filter != null && this.params.filter !== undefined) {
      this.sortOrder = this.params.filter || 'newest';
    }
    this.GetBulletinBoardList();
    this.checkLocalPermission()
  }

  add() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-bulletin-board']);
  }
  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    let resp = allPermision.find(x => x.ProfileId == 14); 
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }


  GetBulletinBoardList() {
    this.ngxservice.show();
    let requestdata = [];
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetBulletinBoardList"
    });
    requestdata.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = { "content": strRequestData };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        this.ngxservice.hide();
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            if (data.Totalrecords == "0") {
              this.toast.error("No Data Found");
              return;
            }
            this.BulletinBoardList = Array.isArray(data.BulletinBoardList?.BulletinBoard)
              ? data.BulletinBoardList.BulletinBoard
              : [data.BulletinBoardList.BulletinBoard];

            this.BulletinBoardList = this.BulletinBoardList.map(item => ({
              ...item,
              IsRead: item.IsRead === '1' // Ensure IsRead is a boolean
            }));
            // console.log('BulletinBoardList1', this.BulletinBoardList);
            this.sortBulletinBoardList(); // SORT LIST AFTER FETCHING DATA

          }
        } catch (ext) { }
      },
      error: err => {
        this.ngxservice.hide();
        console.log(err);
      }
    });
  }

  openBulletin(item) {
    this.isBulletinPopup = true;
    this.BulletinObject = {
      Title: item.Title,
      BulletinData: this.sanitizer.bypassSecurityTrustHtml(item.BulletinData),
      IsRead: item.IsRead // ensuring that bulletin is read or not
    };
    // console.log('isRead', this.BulletinObject)
  }

  sortBulletinBoardList() {
    this.filteredBulletinBoardList = this.BulletinBoardList.sort((a, b) => {
      if (this.sortOrder === 'un-read') {
        return a.IsRead === b.IsRead ? 0 : a.IsRead ? 1 : -1;
      } else if (this.sortOrder === 'read') {
        return a.IsRead === b.IsRead ? 0 : a.IsRead ? -1 : 1;
      }

      // When not sorting by unread, use date-based sorting
      const dateA = new Date(a.CreatedDate).getTime();
      const dateB = new Date(b.CreatedDate).getTime();

      if (this.sortOrder === 'newest') {
        return dateB - dateA; // Newest first
      } else if (this.sortOrder === 'oldest') {
        return dateA - dateB; // Oldest first
      }

      return 0; // Default case
    });
  }



  setSortOrder(order: string) {
    this.sortOrder = order;
    this.sortBulletinBoardList(); // SORT LIST BASED ON NEW ORDER
  }

  markAsRead() {
    this.BulletinObject.IsRead = true;

    this.BulletinBoardList = this.BulletinBoardList.map(item =>
      item.Title === this.BulletinObject.Title ? { ...item, IsRead: true } : item
    );
    this.isBulletinPopup = false;
    this.saveReadStatus();
    this.sortBulletinBoardList();
  }

  saveReadStatus() {
    // checking BulletinBoardList title and BulletinObject title is equal or not 
    const BulletinBoard = this.BulletinBoardList.find(items => items.Title === this.BulletinObject.Title)

    let requestData = [];

    requestData.push({
      "Key": "APIType",
      "Value": "SaveBulletinBoardUserData"
    });

    requestData.push({
      "Key": "BulletinBoardGUID",
      "Value": BulletinBoard.BulletinBoardGUID
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.remark
    });


    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };


    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode === '0') {
          this.toast.success("Marked as read successfully");
        } else {
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            response['errorMessageJson'] = result;
            this.handleError(response);
          });
        }
      },
      error: err => {
        console.log(err);
        if (err.includes('"message":"Cannot')) {
        }
      }
    });
  }


  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
  }
}



