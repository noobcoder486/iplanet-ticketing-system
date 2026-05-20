import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

@Component({
  selector: 'nitc-form-child-grid',
  templateUrl: './form-child-grid.component.html',
  styleUrls: ['./form-child-grid.component.scss']
})
export class FormChildGridComponent implements OnInit {

  @Input() gridcolumns: any;
  @Input() dataSource: Observable<any>;
  @Input() actions: any[];


  isLoading = true;
  totalcount: any = 0;
  isLoad: boolean = false;

  // actions: any[] =[];
  @Output() actionEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  columnNames: any[] = [];
  displayedColumns: any[] = [];
 

  dataDetailSource: any;
  constructor(
    private ref: ChangeDetectorRef
  ) {
    //this.actions = ['EDIT', 'DELETE'];

  }

  ngOnInit() {  
    this.gridcolumns.map((c) => c.title).forEach(x => {
      this.displayedColumns.push(x);
    });
    this.displayedColumns.push('actions');   
  }
 
  

  ngAfterViewInit() {
    this.dataSource.subscribe((data: any) => {
     
      if(data == null)
        return;
      
      this.dataDetailSource = new MatTableDataSource(data);   
      this.dataDetailSource._updateChangeSubscription();      
      this.ref.detectChanges();
     
    })

     
  }

  action(act: any, row: any) {    
    this.actionEvent.emit({ action: act, row: row })
  }

  getVal(data){  
    if(typeof  data === 'object'){
      return data.Text;
    }
    return data;
  }

 
}
