import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateTabComponent } from './createtab.component';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from "src/app/config/global";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'my-tabs-create',
  template: `
    <div class="tab_content_header" style="height:30px;">
      <h3 class="header_text">{{pageTitle}}</h3>
      <div style=" display: flex; justify-content: right; position: absolute; margin-left: 6%; margin-right: 37%; margin-top: 8px;">
    <div class="bulletin-scroll" style="flex: 1; overflow: hidden; margin-left: 20px;">
        
        <marquee behavior="scroll" direction="left" scrollamount="5" style="white-space: nowrap;" 
          *ngIf="bulletins.length">
          <span *ngFor="let bulletin of bulletins; let i = index;">
            <span class="bulletin-item"  (click)="viewBulletins()" style="font-weight: 500; cursor: pointer;">
             <img *ngIf="isNewBulletin(bulletin.createdDate)" src="assets/images/new.gif" alt="New" style="width: 40px; height: 40px; vertical-align: middle;">
            {{ bulletin.title }}
             </span>
            <span *ngIf="i < bulletins.length - 1">&nbsp;&nbsp; | &nbsp;&nbsp;</span>
          </span>
        </marquee>
      </div>
    </div>

      <div style="display: flex; justify-content: right; position: absolute; margin-left: 67%;">
        <div class="create_btn">
          <button style="white-space: nowrap; width: 100%; font-size: 12px !important;" class="create_btn_content" (click)="CreateSales()">Token Selection</button>
        </div>
        <div class="create_btn">
          <button style="white-space: nowrap; width: 100%; font-size: 12px !important;" class="create_btn_content" (click)="StockFind()">Stock Finder</button>
        </div>
        <div class="create_btn">
          <button style="white-space: nowrap; width: 100%; font-size: 12px !important;" class="create_btn_content" (click)="PriceFind()">Price Finder</button>
        </div>
        <div class="create_btn">
          <div>
            <div (click)="ViewBulletinBoard()" style="text-align: center; padding-top: 5px; position: relative;">
              <i style="font-size:18px !important;" class="iconbtn fa-light fa-bullhorn" matTooltip="View All Bulletins">
                <div style="padding-bottom: 5px; padding-left: 20px;">
                <span class="badge" *ngIf="unReadCount > 0">{{unReadCount}}</span>
                </div>
              </i>
            </div>
          </div>   
        </div>
      </div>

      <ul class="layout_icons_wrapper wauto">
        <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
          <span *ngIf="tab.gridicon != null && tab.gridicon != undefined" class="grid_svg_layout layout_icons_content" [innerHtml]="tab.gridicon"></span>
          <a *ngIf="tab.title != null && tab.title != undefined">{{tab.title}}</a>
        </li>
      </ul>
    </div>
    <ng-content></ng-content>
  `,
  styles: [
    `
      .tab-close {
        color: gray;
        text-align: right;
        cursor: pointer;
      }
        
      .iconbtn:hover .badge {
        display: block;
      }

      .badge {
        display: block;
        background-color: red;
        color: white;
        border-radius: 50%;
        padding: 0px 4px;
        position: absolute;
        top: -5px;
        right: -17px;
        font-size: 10px !important;
        padding-top: 2px;
        padding-left: 4px;
        padding-right: 4px;
      }
	  
    `
  ]
})
export class CreateTabsComponent implements AfterContentInit {
  @Input('pageTitle') pageTitle: string;
  @Input() onCreate: () => void;
  @Input() viewBulletinBoard: () => void;
  @Input() onPriceFinder: () => void;
  @Input() onStockFinder: () => void;

  unReadCount: number = 0;
  bulletins: any[] =[]
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dynamicService: DynamicService,
    private toaster : ToastrService
  ) { }

  @ContentChildren(CreateTabComponent) tabs: QueryList<CreateTabComponent>;

  ngAfterContentInit() {
    this.getData();
    this.getUnclaimedData4User()
    this.getCashDepositWarning()
    let activeTabs = this.tabs.filter((tab) => tab.active);
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }    
  }

  selectTab(tab: CreateTabComponent) {
    this.tabs.toArray().forEach((tab) => {
      tab.active = false;
      tab.activeChange.emit(false);
    });
    tab.active = true;
    tab.activeChange.emit(true);
  }

  getUnclaimedData4User() {
    let requestdata = [];
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetUnclaimedData4User"
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            let UnclaimedList = Array.isArray(data.UnclaimedList?.Unclaimed) ? data.UnclaimedList?.Unclaimed : [data.UnclaimedList?.Unclaimed]
             UnclaimedList.forEach( item => {
               this.toaster.warning(item.CaseId  , 'Warning: Kindly move this CaseId to Unclaimed bin', { disableTimeOut: true, tapToDismiss: false, closeButton: true })
             })
          }
        } catch (ext) {
          console.error("Error processing response:", ext);
        } 
      },
      error: err => {
        console.log("Error in API call:", err);
      }
    });
  }

  getCashDepositWarning() {
    let requestdata = [];
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetCashDeposit4User"
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = { "content": strRequestData };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
           
            this.toaster.warning(data.Message, '', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
          }
        } catch (ext) {
          console.error("Error processing response:", ext);
        }
      },
      error: err => {
        console.log("Error in API call:", err);
      }
    });
  }

  getData() {
    let requestdata = [];
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetBulletinData4User"
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            let bulletinList = Array.isArray(data.BulletinBoardList?.Bulletin) ? data.BulletinBoardList?.Bulletin : [data.BulletinBoardList?.Bulletin]
            // this.bulletins = bulletinList.map(bulletin => bulletin.Title).slice(0, 5);
            this.bulletins = bulletinList.map(bulletin => ({
              title: bulletin.Title,
              createdDate: bulletin.CreatedDate ? new Date(bulletin.CreatedDate) : null
            })).slice(0, 5);
            this.unReadCount = parseInt(data.UnreadCount || '0');
          }
        } catch (ext) {
          console.error("Error processing response:", ext);
        }
      },
      error: err => {
        console.log("Error in API call:", err);
      }
    });
  }


  isNewBulletin(date: Date): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 3);
    return date > oneWeekAgo;
  }

  ViewBulletinBoard() {
    this.viewBulletinBoard();
  }

  viewBulletins(){
    this.router.navigate(['/auth/'+glob.getCompanyCode()+'/bulletin-board'],{queryParams: {filter: 'un-read'}});
  }


  CreateSales() {
    this.onCreate();
  }

  PriceFind() {
    this.onPriceFinder();
  }

  StockFind() {
    this.onStockFinder();
  }

}


