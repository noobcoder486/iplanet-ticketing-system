import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-convert-to-stock-pop',
  templateUrl: './convert-to-stock-pop.component.html',
  styleUrls: ['./convert-to-stock-pop.component.css']
})
export class ConvertToStockPopComponent implements OnInit {


  @Input() data
  @Output() ConvertStockData =new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.ConvertStockData.emit(this.data)
  }

}
