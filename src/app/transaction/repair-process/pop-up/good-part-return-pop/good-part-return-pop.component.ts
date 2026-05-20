import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-good-part-return-pop',
  templateUrl: './good-part-return-pop.component.html',
  styleUrls: ['./good-part-return-pop.component.css']
})
export class GoodPartReturnPopComponent implements OnInit {

  @Input() data
  @Output() GoodPartReturn =new EventEmitter<any>();

  

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.GoodPartReturn.emit(this.data)
  }

}
