import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { CaseDetail } from '../../repair-process.metadata';

@Component({
  selector: 'app-stock-doa-pop',
  templateUrl: './stock-doa-pop.component.html',
  styleUrls: ['./stock-doa-pop.component.css']
})
export class StockDOAPopComponent implements OnInit {

  component
  issues
  componentSet
  issuesSet
  ComponentList: any[] = [];
  ComponentIssueList: any[] = [];
  IssuesList: any[] = [];
  
    
    @Input() data
    @Input() repa: CaseDetail;
    @Output() StockDOA =new EventEmitter<any>();

  
  
    constructor(
      private dynamicService: DynamicService,
      private gsxService :GsxService ,
      private toaster: ToastrService,
    ) { }
  
  
  
  
    ngOnInit(): void {
      this.onSelectComponent({ term: "", items: [] });
      this.onSelectIssue({ term: "", items: [] });
      this.get_Component_Issue()
    }
  
    onSelectComponent($event) { this.IssuesList = $event.issues; }
    onSelectIssue($event: { term: string; items: any[] }) { }
  
    get_Component_Issue() {
      let searchData = { device: { "id": this.repa.SerialNo1 } };
      let strRequestData = JSON.stringify(searchData);
      let contentRequest = {
        "content": strRequestData
      };
      this.gsxService.getComponentIssue(contentRequest).subscribe(
        {
          next: (value) => {
            // console.log("My Values:", value);
            let response = JSON.parse(value.toString());
            this.ComponentIssueList = response.componentIssues;
            this.ComponentList = this.ComponentIssueList;
          }
        });
    }
  
    setComponentIssues(){
      this.componentSet = this.component.componentDescription
      this.issuesSet = this.issues.description
    }
  
    onSubmit(){
      this.StockDOA.emit(this.data)
    }

}
