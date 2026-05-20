import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.sass']
})
export class NotesListComponent implements OnInit {

  showonlyselected:boolean=false;
  toastr: any;
  searchText: String = "";
  noteslist: any[]= [];
  noteslistFinal: any[]= [];

  @Output() selectedNotesList = new EventEmitter<any>();
  @Output() NotesListClose = new EventEmitter<any>();

  constructor(
  )
  { }

  ngOnInit() {
    this.addNotesList()
  }

addNotesList(){
  this.noteslist.push(
    { number: '1',
      notes: 'Iphone in dispaly Damage'},
    { number: '2',
      notes: 'MacBook in dispaly Damage'},
    { number: '3',
      notes: 'iMac in dispaly Damage'},
    { number: '4',
      notes: 'Macbook Pro in dispaly Damage'},
    { number: '5',
      notes: 'MacBook Air in dispaly Damage'},
    { number: '6',
      notes: 'Keyboard Damage '},
    { number: '7',
      notes: 'Display Water Damage'})
  console.log("Data" ,this.noteslist)
} 





onSubmit() {
  this.noteslistFinal=[];
    if(this.noteslistFinal != undefined)
    {
      this.noteslistFinal = this.noteslistFinal
    }
  for(let item of this.noteslist) {
    if(item.selected == true) {
      let retvalue = this.noteslist.filter(number=>number.toString() == item.number.toString());

      this.noteslistFinal.push(item);
    }
  }
  let close  = false 
this.selectedNotesList.emit(this.noteslistFinal)  
this.NotesListClose.emit(close)  
console.log("Data" , this.noteslistFinal)
}


onSearchChange(text) {
  console.log(text);

  for(let item of this.noteslist) {
    if(text.length > 1){
      item.inSearch = (item.notes.toLowerCase().includes(text.toLowerCase()) || item.number.toLowerCase().includes(text.toLowerCase()));
    }else{
      item.inSearch = false;
    }
  }
}


sortArrayOfObjects = <T>(
  data: T[],
  keyToSort: keyof T,
  direction: 'ascending' | 'descending' | 'none',
) => {
  if (direction === 'none') {
    return data
  }
  const compare = (objectA: T, objectB: T) => {
    const valueA = objectA[keyToSort]
    const valueB = objectB[keyToSort]
    
    if (valueA === valueB) {
      
      return 0
    }

    if (valueA > valueB) {
      return direction === 'ascending' ? 1 : -1
    } else {
      return direction === 'ascending' ? -1 : 1
    }
  }

  return data.slice().sort(compare)
}



isToShowTr(item): Boolean {
  if(this.showonlyselected==false)
  {
      if(this.searchText.length <= 1){
        return true;
      }else if(item.selected == true){
        return true;
      } else if (item.inSearch) {
        return true;
      } else{
        return false;
      }
  }
  else
  {
    if(item.selected == true)
    {
      return true;
    } else{
      return false;
    }

  }
}

}
