import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomComponentService } from '../custom-component.service';

@Component({
  selector: 'app-encrypt-decrypt',
  templateUrl: './encrypt-decrypt.component.html',
  styleUrls: ['./encrypt-decrypt.component.scss']
})
export class EncryptDecryptComponent implements OnInit {

  encryptText: string = '';
  encryptValue: string = '';

  constructor(
    private customtService: CustomComponentService,
    private toastr: MatSnackBar,
  ) { 
  }

  ngOnInit(): void {
  }

  encrypt() {
    // let meta = new DecryptMetaData();
    // meta.Text = this.encryptText.toString()
    let meta ={
      Text : this.encryptText.toString()
    }
    this.customtService.decryptText(meta)
      .subscribe((resp: any) => {
        this.encryptText = resp;
      },
        error => {
          this.toastr.open('This is not good!', 'Oops!');
        })
  }

}
