import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Alert } from 'selenium-webdriver';
import { ActionMetaData } from 'src/app/models/action.metadata';
import * as glob from "../../config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';


@Component({
  selector: 'nitc-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, AfterViewInit {

  @Input() gridcolumns: any;
  @Input() dataSource: Observable<any>;
  @Input() actions: any[];
  @Input() isAllowSelect: boolean = false;
  @Input() isAllowSelect1: boolean = false;
  @Input() hideSpinnerEvents?: Observable<void>;

  isLoading = true;
  totalcount: any = 0;
  isLoad: boolean = false;


  // actions: any[] =[];
  @Output() actionEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();


  columnNames: any[] = [];
  displayedColumns: any[] = [];
  @ViewChild('paginator') paginator!: MatPaginator;


  dataDetailSource: any;
  selection = new SelectionModel<any>(false, []);
  private hideSpinnerSubscription?: Subscription;
  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private dynamicService: DynamicService
  ) {
    //this.actions = ['EDIT', 'DELETE'];

  }
  function() {





  }

  ngOnInit() {
    // this.QueryParamsBind();
    if (this.actions?.length > 0) {
      this.displayedColumns.push('actions');
    }
    if (this.isAllowSelect == true) {
      this.displayedColumns.push("select");
    }
    if (this.isAllowSelect1 == true) {
      this.displayedColumns.push("select");
    }


    this.gridcolumns.map((c) => c.title).forEach(x => {
      let isExist = this.displayedColumns.find(z => z == x);
      if (isExist == undefined) {
        this.displayedColumns.push(x);
      }
    });
    this.hideSpinnerSubscription = this.hideSpinnerEvents?.subscribe(() => {
      this.isLoading = false;
    });

  }




  stepper_Fun() {
    this.router.navigate(['/auth/'+glob.getCompanyCode()+'/customer-stepper']);
    // this.QueryParamsBind()
  }
  ngOnDestroy() {
    this.hideSpinnerSubscription?.unsubscribe();

  }


  ngAfterViewInit() {
    this.dataSource.subscribe((data: any) => {
      if (data == null)
        return;

      console.log(data.Data);

      this.dataDetailSource = new MatTableDataSource(data.Data);
      this.dataDetailSource._updateChangeSubscription();
      this.ref.detectChanges();

      this.totalcount = data.totalRecord;
      if (this.isLoad == false) {
        this.dataDetailSource.paginator = this.paginator;
      }

      this.isLoad = true;
      this.isLoading = false;
    })


  }

  action(act: String, row: any) {

    this.actionEvent.emit({ action: act, row: row })
  }

  pageChanged = (event) => {
    this.changeEvent.next({ eventType: 'PageChange', eventDetail: event });
    this.isLoading = true;
  }

  sortData = (event) => {
    this.changeEvent.next({ eventType: 'Sorting', eventDetail: event });
    this.isLoading = true;
  }


  width = (val) => {
    return 'red';
    //val + " !important";
  }

  // Query Paramater Api Method

  // QueryParamsBind(){
  //   const requestDataCustomer=[];
  //   console.log("Checking today", requestDataCustomer)
  //   requestDataCustomer.push({
  //     "Key":"ApiType",
  //     "Value":"GetRtlCustomerObject"
  //   })
  //   requestDataCustomer.push({
  //     "Key":"CustomerCode",
  //     "Value":"8607185"

  //   })
  //   requestDataCustomer.push({
  //     "Key":"CompanyCode",
  //     "Value":glob.getCompanyCode()
  //   })

  //   let strRequestData = JSON.stringify(requestDataCustomer);
  //   let contentRequest =
  //   {
  //     "content" : strRequestData
  //   };

  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {

  //       next : (Value) =>
  //       {

  //         try{

  //           let response = JSON.parse(Value.toString());
  //           console.log("data1",response);
  //           ;
  //           if(response.ReturnCode =='0')
  //           {
  //             response['ExtraData']['Customer'] = JSON.parse(response.ExtraData);
  //           }
  //           else{

  //           }
  //         }
  //         catch(ext){




  //         }
  //       },
  //       error : err =>
  //       {



  //       }
  //     }
  //   );
  // }


}



