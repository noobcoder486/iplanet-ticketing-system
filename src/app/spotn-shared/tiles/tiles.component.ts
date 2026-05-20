import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.css']
})
export class TilesComponent implements OnInit {

  @Input() data: any;
  @Output() onCardSelected = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {

  }

  getColClass(index: number): string {
    let newIndex= index+1;
    if( newIndex <= 5) {
    }else{
      newIndex = newIndex/2;
    }
    return this.getColorClass(newIndex);
  }

  getColorClass(index: number): string {
    switch(index) {
      case 1:
        return "first_card";
      case 2:
        return "sec_card";
      case 3:
        return "third_card";
      case 4:
        return "fourth_card";
      case 5:
        return "five_card";
      default:
        return "first_card";
    }
  }

  onCardSelect(job){
    console.log(job);

    this.onCardSelected.emit(job);
  }
}
