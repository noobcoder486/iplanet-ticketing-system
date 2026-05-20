import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';

@Component({
  selector: 'app-page500',
  templateUrl: './page500.component.html',
  styleUrls: ['./page500.component.scss']
})
export class Page500Component implements OnInit {

  constructor(
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit() { }

  submit() {
    //this.router.navigate(['/authentication/signin']);
   // this.commonService.backURL();
   this.router.navigate(['/'])
  }


}
