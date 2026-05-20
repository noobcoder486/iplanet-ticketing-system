import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.sass']
})
export class GridComponent implements OnInit {

  constructor() { }
  itemList: any = [];
  itemCount: any = 0;
  ngOnInit(): void {
    this.LoadItems();
  }


  LoadItems() {
    // ;
    this.itemCount = this.itemCount + 1;
    var list = this.itemList;
    var itmCnt = this.itemList.length + 1;
    var newObj = {
      isChecked: false,
      itemName: 'item ' + itmCnt.toString(),
      itemType: '',
      quantity: '',
      discount: '',
      costPrice: '',
      companyCode: "",
      taxAmount: "",
      currency:"",
      rowId: this.itemCount
    }

    this.itemList = [];
    this.itemList.push(newObj);
    list.forEach(e => {
      this.itemList.push(e);
    });
  }

  onItemRowChange(event, value, item) {
    // ;
    var key = event.target.id;

    this.itemList.forEach(e => {
      if (e.rowId == item.rowId) {
        e[key] = value;
        return;
      }
    })
  }
}
