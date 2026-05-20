import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  AfterViewInit,
  Renderer2,
  ChangeDetectionStrategy
} from '@angular/core';
import { RightSidebarService } from 'src/app/core/service/rightsidebar.service';
import { ConfigService } from 'src/app/config/config.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightSidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, AfterViewInit
{
  selectedBgColor = 'white';
  maxHeight: string;
  maxWidth: string;
  showpanel = false;
  isOpenSidebar: boolean;
  isDarkSidebar = false;
  isDarTheme = false;
  isRtl = false;
  public config: any = {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService
  ) {
    super();
  }

  ngOnInit() {
    this.config = this.configService.configData;
    this.subs.sink = this.rightSidebarService.sidebarState.subscribe(
      (isRunning) => {
        this.isOpenSidebar = isRunning;
      }
    );
    this.setRightSidebarWindowHeight();
  }
  ngAfterViewInit() {
    // set header color on startup
    if (sessionStorage.getItem('choose_skin')) {
      this.renderer.addClass(
        this.document.body,
        sessionStorage.getItem('choose_skin')
      );
      this.selectedBgColor = sessionStorage.getItem('choose_skin_active');
    } else {
      this.renderer.addClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
      this.selectedBgColor = this.config.layout.theme_color;
    }

    if (sessionStorage.getItem('menuOption')) {
      if (sessionStorage.getItem('menuOption') === 'menu_dark') {
        this.isDarkSidebar = true;
      } else if (sessionStorage.getItem('menuOption') === 'menu_light') {
        this.isDarkSidebar = false;
      } else {
        this.isDarkSidebar =
          this.config.layout.sidebar.backgroundColor === 'dark' ? true : false;
      }
    } else {
      this.isDarkSidebar =
        this.config.layout.sidebar.backgroundColor === 'dark' ? true : false;
    }

    if (sessionStorage.getItem('theme')) {
      if (sessionStorage.getItem('theme') === 'dark') {
        this.isDarTheme = true;
      } else if (sessionStorage.getItem('theme') === 'light') {
        this.isDarTheme = false;
      } else {
        this.isDarTheme = this.config.layout.variant === 'dark' ? true : false;
      }
    } else {
      this.isDarTheme = this.config.layout.variant === 'dark' ? true : false;
    }

    if (sessionStorage.getItem('isRtl')) {
      if (sessionStorage.getItem('isRtl') === 'true') {
        this.setRTLSettings();
      } else if (sessionStorage.getItem('isRtl') === 'false') {
        this.setLTRSettings();
      }
    } else {
      if (this.config.layout.rtl == true) {
        this.setRTLSettings();
      } else {
        this.setLTRSettings();
      }
    }
  }

  selectTheme(e) {
    this.selectedBgColor = e;
    const prevTheme = this.elementRef.nativeElement
      .querySelector('.right-sidebar .demo-choose-skin li.actived')
      .getAttribute('data-theme');
    this.renderer.removeClass(this.document.body, 'theme-' + prevTheme);
    this.renderer.addClass(this.document.body, 'theme-' + this.selectedBgColor);
    sessionStorage.setItem('choose_skin', 'theme-' + this.selectedBgColor);
    sessionStorage.setItem('choose_skin_active', this.selectedBgColor);
  }
  lightSidebarBtnClick() {
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    const menuOption = 'menu_light';
    sessionStorage.setItem('choose_logoheader', 'logo-white');
    sessionStorage.setItem('menuOption', menuOption);
  }
  darkSidebarBtnClick() {
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    const menuOption = 'menu_dark';
    sessionStorage.setItem('choose_logoheader', 'logo-black');
    sessionStorage.setItem('menuOption', menuOption);
  }
  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');

    if (sessionStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        sessionStorage.getItem('choose_skin')
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'theme-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    this.selectedBgColor = 'white';
    this.isDarkSidebar = false;
    sessionStorage.setItem('choose_logoheader', 'logo-white');
    sessionStorage.setItem('choose_skin', 'theme-white');
    sessionStorage.setItem('theme', theme);
    sessionStorage.setItem('menuOption', menuOption);
  }
  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (sessionStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        sessionStorage.getItem('choose_skin')
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'theme-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    this.selectedBgColor = 'black';
    this.isDarkSidebar = true;
    sessionStorage.setItem('choose_logoheader', 'logo-black');
    sessionStorage.setItem('choose_skin', 'theme-black');
    sessionStorage.setItem('theme', theme);
    sessionStorage.setItem('menuOption', menuOption);
  }

  setRightSidebarWindowHeight() {
    const height = window.innerHeight - 137;
    this.maxHeight = height + '';
    this.maxWidth = '500px';
  }
  onClickedOutside(event: Event) {
    const button = event.target as HTMLButtonElement;
    if (button.id !== 'settingBtn') {
      if (this.isOpenSidebar === true) {
        this.toggleRightSidebar();
      }
    }
  }
  toggleRightSidebar(): void {
    this.rightSidebarService.setRightSidebar(
      (this.isOpenSidebar = !this.isOpenSidebar)
    );
  }

  switchDirection(event: MatSlideToggleChange) {
    var isrtl: string = String(event.checked);
    if (
      isrtl === 'false' &&
      document.getElementsByTagName('html')[0].hasAttribute('dir')
    ) {
      document.getElementsByTagName('html')[0].removeAttribute('dir');
      this.renderer.removeClass(this.document.body, 'rtl');
    } else if (
      isrtl === 'true' &&
      !document.getElementsByTagName('html')[0].hasAttribute('dir')
    ) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
      this.renderer.addClass(this.document.body, 'rtl');
    }
    sessionStorage.setItem('isRtl', isrtl);
    this.isRtl = event.checked;
  }
  setRTLSettings() {
    document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
    this.renderer.addClass(this.document.body, 'rtl');
    this.isRtl = true;
    sessionStorage.setItem('isRtl', 'true');
  }
  setLTRSettings() {
    document.getElementsByTagName('html')[0].removeAttribute('dir');
    this.renderer.removeClass(this.document.body, 'rtl');
    this.isRtl = false;
    sessionStorage.setItem('isRtl', 'false');
  }
}
