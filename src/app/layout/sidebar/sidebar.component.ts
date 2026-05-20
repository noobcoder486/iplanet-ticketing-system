import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy
} from '@angular/core';
import { ROUTES } from './sidebar-items';
import { AuthService } from 'src/app/core/service/auth.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';
import { AddUserMetaData, UserRegistrationMetaData } from 'src/app/core/models/profilemodule.metadata';
import { CommonService } from 'src/app/core/service/common.service';
import { UnderscoreService } from 'src/app/core/service/underscore.service';
import { AppRouter } from 'src/app/config/comman.const';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, OnDestroy {
  public sidebarItems: any[];
  level1Menu = '';
  level2Menu = '';
  level3Menu = '';
  public innerHeight: any;
  public bodyTag: any;
  listMaxHeight: string;
  listMaxWidth: string;

  headerHeight = 60;
  routerObj = null;
  mainActive: string = '';
  userDetails: AddUserMetaData;
  imageSrc: any;
  searchText: string = "";

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private underscoreService: UnderscoreService,
    private commonService: CommonService,
  ) {
    super();

    if (this.authService.currentUserValue) {
      let menus = JSON.parse(sessionStorage.getItem('MenuDetail'));
      let items = this.formatMenu(menus);
      sessionStorage.setItem('AllSidebarItems', JSON.stringify(items));
      this.sidebarItems = items;
    }

    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let menu = JSON.parse(sessionStorage.getItem('selectedMenu'));

        this.level1Menu = menu != null ? menu.moduleName.toLowerCase().trim() : '';
        this.level2Menu = menu != null ? menu.title.toLowerCase().trim() : '';

        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
        this.setMainActive();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  windowResizecall(event) {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }

  callLevel1Toggle(event: any, element: any) {

    if (element === this.level1Menu) {
      this.level1Menu = '0';
    } else {
      this.level1Menu = element;
    }

    const hasClass = event.target.classList.contains('toggled');
    if (hasClass) {
      this.renderer.removeClass(event.target, 'toggled');
    } else {
      document.body.className = document.body.className.replace('toggled', '');
      this.renderer.addClass(event.target, 'toggled');
    }
    this.setMainActive();

  }

  callLevel2Toggle(event: any, element: any) {
    if (element === this.level2Menu) {
      this.level2Menu = '0';
    } else {
      this.level2Menu = element;
    }
  }

  callLevel3Toggle(event: any, element: any) {
    if (element === this.level3Menu) {
      this.level3Menu = '0';
    } else {
      this.level3Menu = element;
    }
  }

  ngOnInit() {
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
    this.setMainActive();
    let result = JSON.parse(sessionStorage.getItem('currentUser'));
    this.userDetails = result.UserDetails;
    this.imageSrc = 'upload/userimage/' + this.userDetails.ImageName;
  }

  checkMenuPermission = (moduleId, permission) => {
    let resp = permission.find(x => x.ModuleId == moduleId);
    return resp != undefined && resp?.View ? true : false;
  }

  formatMenu = (menus) => {

    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    let details = [];
    let allMenu = [];

    for (let m = 0; m < menus.length; m++) {
      let row = menus[m]
      let detail = {
        path: "",
        title: row[0].HeadingName,
        moduleName: row[0].HeadingName,
        icon: row[0].HeadingLogo,
        class: 'menu-toggle',
        groupTitle: false,
        routerActive: '',
        submenu: [],
        permission: true,
      }

      let result = this.commonService.groupBy(row, x => x.SubHeadingId);
      let count = result.size;
      //if Sub heading not exist
      if (count == 1) {
        for (let j = 0; j < row.length; j++) {
          let chRow = row[j]
          if (this.checkMenuPermission(chRow.ModuleId, allPermision)) {
            let childDetail = {
              path: chRow.Url, title: chRow.ModuleName, moduleName: chRow.HeadingName,
              icon: 'fas fa-tachometer-alt', class: 'ml-menu', groupTitle: false,
              childMenu: [], id: this.commonService.getRandomNo(),
            }
            detail.submenu.push(childDetail);
            allMenu.push(childDetail);
          }
        }
      }

      //if Sub heading exist
      else if (count > 1) {
        for (let resp of result) {
          resp = resp[1];
          let chRow = resp[0];
          if (chRow.SubHeadingId != 0) {
            let child = [];
            child = resp;

            let count = 0;
            for (let r of resp) {
              r.id = this.commonService.getRandomNo();
              if (this.checkMenuPermission(r.ModuleId, allPermision)) {
                allMenu.push(r);
                count++;
              }
            }

            if (count > 0) {
              let cDetail = {
                path: chRow.Url, title: chRow.SubHeadingName, moduleName: chRow.HeadingName,
                icon: 'fas fa-tachometer-alt', class: 'ml-menu', groupTitle: false,
                childMenu: child, id: this.commonService.getRandomNo(),
              }
              detail.submenu.push(cDetail);
            }

          }
          else {
            for (let r of resp) {
              if (this.checkMenuPermission(r.ModuleId, allPermision)) {

                let cDetail = {
                  path: r.Url, title: r.ModuleName, moduleName: r.HeadingName,
                  icon: 'fas fa-tachometer-alt', class: 'ml-menu', groupTitle: false,
                  childMenu: [], id: this.commonService.getRandomNo(),
                }

                detail.submenu.push(cDetail);
                allMenu.push(cDetail);
              }
            }
          }
        }
      }

      if (detail.submenu.length > 0) {
        details.push(detail);
      }
    }

    sessionStorage.setItem('allMenu', JSON.stringify(allMenu));
    if (this.commonService.checkCompanyPermission()) {
      return details;
    }
    else {
      return [];
    }
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  initLeftSidebar() {
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }

  checkStatuForResize(firstTime) {
    if (window.innerWidth < 1170) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }

  mouseHover(e) {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }

  mouseOut(e) {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  routeToUrl(item) {
    sessionStorage.setItem('selectedMenu', JSON.stringify(item));
    if (item.childMenu.length == 0) {
      this.activatedRoute.params.subscribe((data: any) => {
        this.router.navigate(["auth/" + data.companycode + "/" + item.path]);
      });
    }
    else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.activatedRoute.params.subscribe((data: any) => {
          this.router.navigate(["auth/" + data.companycode + "/" + AppRouter.SubMenu]);
        })
      );
    }

  }

  setMainActive() {
    if (this.level1Menu == undefined)
      return;

    let level1 = this.level1Menu.toLowerCase().trim();
    level1 = level1.replace(/ /g, "");
    let level2 = this.level2Menu?.toLowerCase().trim();
    level2 = level2?.replace(/ /g, "");

    for (let side of this.sidebarItems) {
      let str = side.title.toLowerCase().trim();
      str = str.replace(/ /g, "");
      side.routerActive = str == level1 ? 'active' : '';

      for (let sub of side?.submenu) {
        let child = sub.title.toLowerCase().trim();
        child = child.replace(/ /g, "");
        sub.class = child == level2 ? 'ml-menu ml-menu-focus  first-menu-focus' : 'ml-menu ml-menu-focus';
      }
    }

    let result = this.sidebarItems.find(x => x.routerActive == 'active');
    this.mainActive = result != undefined ? result.title : '';
  }

  onMenuSearch = (event) => {
    this.sidebarItems = this.commonService.onMenuSearch(event, this.sidebarItems)
  }








}
