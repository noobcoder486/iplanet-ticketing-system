import { Component, OnInit } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppInitService } from './core/service/app.init.service';
import { GLOBALVARIABLE } from './config/global';
import { RightSidebarComponent } from './layout/right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  currentUrl: string;
  constructor(
    public _router: Router,
    private appInitService: AppInitService,
    location: PlatformLocation,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,

  ) {
    if (sessionStorage.getItem(GLOBALVARIABLE.TOKEN) != undefined) {
      this.appInitService.init();
    }
    this._router.events.subscribe((routerEvent: Event) => {

      if (routerEvent instanceof NavigationStart) {
        this.spinner.show();
        location.onPopState(() => {
          window.location.reload();
        });
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        this.spinner.hide();
      }
      window.scrollTo(0, 0);
    });
  }


  ngOnInit(): void {
    this.callInitService();
  }


  callInitService() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let url = event.url.split('/');
        '';
        if (url.length > 2) {
          this.appInitService.initNotFound(url[2]);
        }
      }
    })
  }
}
