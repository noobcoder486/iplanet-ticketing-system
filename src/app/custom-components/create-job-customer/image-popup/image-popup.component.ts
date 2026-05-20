import { Component, OnInit,Inject } from '@angular/core'; 
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-image-popup',
  templateUrl: './image-popup.component.html',
  styleUrls: ['./image-popup.component.sass']
})
export class ImagePopupComponent implements OnInit {

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {   }
   imageSrc:any;
  
  ngOnInit(): void {
    this.imageSrc=this.data.Imagesrc;
  }

  downloadMyFile()
  {
    
  }

//   downloadMyFile(){
//     alert( this.imageSrc)
//     const link = document.createElement('a');
//     link.setAttribute('target', '_blank');
//     link.setAttribute('href', 'abc.net/files/test.ino');
//     link.setAttribute('download', `products.csv`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
// }
}

  
  
