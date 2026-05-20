import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommonService } from 'src/app/core/service/common.service';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.sass']
})
export class SubmenuComponent implements OnInit {

  childMenu = [];
  companyCode: string = '';
  breadCumbList = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
  ) {
    // this.router.events
    //   .pipe(filter((event) => event instanceof NavigationEnd))
    //   .subscribe((event: any) => {
    //     this.breadCumbList = this.commonService.getBreadCumbs(event.url);
    //   });
    this.breadCumbList = this.commonService.getBreadCumbs(this.router.url);
    // this.activatedRoute.params.subscribe(params => {
    //   let id = +params['id'];
    this.getChildMenu(); 
    // });

  }

  ngOnInit(): void {
  }


  getChildMenu() {
    let result = JSON.parse(sessionStorage.getItem('selectedMenu'));
    this.childMenu = result != undefined ? result.childMenu : [];
  }

  redirectToPage(child) {
    let url = this.commonService.getUrlWithCompanyCode(this.router.url);
    this.router.navigate([url + "/" + child.Url]);
  }

  getBreadCumbText() {
    return this.childMenu?.length > 0 ?
      this.childMenu[0].HeadingName + " / " + this.childMenu[0].SubHeadingName
      : '';
  }

}
