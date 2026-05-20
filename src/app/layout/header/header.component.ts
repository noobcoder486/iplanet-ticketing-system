import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/config/config.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { RightSidebarService } from 'src/app/core/service/rightsidebar.service';
import { WINDOW } from 'src/app/core/service/window.service';
import { LanguageService } from 'src/app/core/service/language.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { MatDialog } from '@angular/material/dialog';
import { CompanyDetailComponent } from 'src/app/dashboard/company-detail/company-detail.component';
import { CommonService } from 'src/app/core/service/common.service';
import * as glob from "../../config/global";
const document: any = window.document;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, AfterViewInit {
  public config: any = {};
  isNavbarCollapsed = true;
  isNavbarShow: boolean;
  flagvalue;
  countryName;
  langStoreValue: string;
  defaultFlag: string;
  isOpenSidebar: boolean;
  userDetails: any[] = []
  setUser(){
     
    this.userDetails.push(glob.getLogedInUser().UserDetails)
  }
  companyPermission: boolean = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    public dialog: MatDialog,
    public commonService: CommonService,

  ) {
    super();
  }

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' }
  ];
  notifications: any[] = [
    {
      userImg: 'assets/images/user/user1.jpg',
      userName: 'Sarah Smith',
      time: '14 mins ago',
      message: 'Please check your mail'
    },
    {
      userImg: 'assets/images/user/user2.jpg',
      userName: 'Airi Satou',
      time: '22 mins ago',
      message: 'Work Completed !!!'
    },
    {
      userImg: 'assets/images/user/user3.jpg',
      userName: 'John Doe',
      time: '3 hours ago',
      message: 'kindly help me for code.'
    },
    {
      userImg: 'assets/images/user/user4.jpg',
      userName: 'Ashton Cox',
      time: '5 hours ago',
      message: 'Lets break for lunch...'
    },
    {
      userImg: 'assets/images/user/user5.jpg',
      userName: 'Sarah Smith',
      time: '14 mins ago',
      message: 'Please check your mail'
    },
    {
      userImg: 'assets/images/user/user6.jpg',
      userName: 'Airi Satou',
      time: '22 mins ago',
      message: 'Work Completed !!!'
    },
    {
      userImg: 'assets/images/user/user7.jpg',
      userName: 'John Doe',
      time: '3 hours ago',
      message: 'kindly help me for code.'
    }
  ];
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset =
      this.window.pageYOffset ||
      this.document.documentElement.scrollTop ||
      this.document.body.scrollTop ||
      0;
    if (offset > 50) {
      this.isNavbarShow = true;
    } else {
      this.isNavbarShow = false;
    }
  }
  ngOnInit() {
    this.setUser()
    this.config = this.configService.configData;

    this.langStoreValue = sessionStorage.getItem('lang');
    const val = this.listLang.filter((x) => x.lang === this.langStoreValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.defaultFlag = 'assets/images/flags/us.jpg';
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }
    this.companyPermission = this.commonService.checkCompanyPermission();
  }
  ngAfterViewInit() {
    // set theme on startup
    if (sessionStorage.getItem('theme')) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(this.document.body, sessionStorage.getItem('theme'));
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }

    if (sessionStorage.getItem('menuOption')) {
      this.renderer.addClass(
        this.document.body,
        sessionStorage.getItem('menuOption')
      );
    } else {
      this.renderer.addClass(
        this.document.body,
        'menu_' + this.config.layout.sidebar.backgroundColor
      );
    }

    if (sessionStorage.getItem('choose_logoheader')) {
      this.renderer.addClass(
        this.document.body,
        sessionStorage.getItem('choose_logoheader')
      );
    } else {
      this.renderer.addClass(
        this.document.body,
        'logo-' + this.config.layout.logo_bg_color
      );
    }

    if (sessionStorage.getItem('sidebar_status')) {
      if (sessionStorage.getItem('sidebar_status') === 'close') {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      } else {
        this.renderer.removeClass(this.document.body, 'side-closed');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
      }
    } else {
      if (this.config.layout.sidebar.collapsed === true) {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      }
    }
  }
  callFullscreen() {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    this.languageService.setLanguage(lang);
  }
  mobileMenuSidebarOpen(event: any, className: string) {
    const hasClass = event.target.classList.contains(className);
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
  public toggleRightSidebar(): void {
    this.subs.sink = this.rightSidebarService.sidebarState.subscribe(
      (isRunning) => {
        this.isOpenSidebar = isRunning;
      }
    );

    this.rightSidebarService.setRightSidebar(
      (this.isOpenSidebar = !this.isOpenSidebar)
    );
  }
  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        sessionStorage.clear();
        this.router.navigate(['/authentication/signin']);
      }
    });
  }

  loadCompany = () => {
    let dialogRef = this.dialog.open(CompanyDetailComponent, {
      width: '80%',
      disableClose: true,
      data: {
        allowtoclose: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result != null && result != undefined) {
        let loc = this.window.origin;
        let companyCode = result.CompanyCode.trim();
        glob.setCompanyCode(companyCode);
        const link = this.document.createElement('a');
        link.target = '_blank';
        link.href = loc + '/#/auth/' + companyCode + '/dashboard';
        link.click();
        link.remove();
        // window.open('auth/'+companyCode+"/dashboard", "_blank");
        //this.router.navigate(['auth/'+companyCode+"/dashboard"]);
      }
    });
  }

  add(){
    this.router.navigate(['/auth/'+glob.getCompanyCode()+'/dashboard']);
  }
   CheckInCheckOut(){
    this.router.navigate(['/auth/'+glob.getCompanyCode()+'/check-in-check-out-details']);

  }

}
