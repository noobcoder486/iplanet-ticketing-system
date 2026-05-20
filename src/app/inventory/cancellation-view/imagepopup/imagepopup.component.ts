import { Component, OnInit,Inject } from '@angular/core'; 
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Observable, Observer } from 'rxjs';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-imagepopup',
  templateUrl: './imagepopup.component.html',
  styleUrls: ['./imagepopup.component.css']
})
export class ImagepopupComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

    Imagesrc:any;
  
  ngOnInit(): void {
    this.Imagesrc =this.data.Imagesrc;
    console.log("IMAGE==",this.Imagesrc)
  }

}
