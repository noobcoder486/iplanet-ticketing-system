import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { RightSidebarComponent } from './layout/right-sidebar/right-sidebar.component';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { fakeBackendProvider } from './core/interceptor/fake-backend';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';
import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ClickOutsideModule } from 'ng-click-outside';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { WINDOW_PROVIDERS } from './core/service/window.service';
import { JwtInterceptorService } from './core/service/jwtinterceptor';
import { DynamicModule } from './dynamic/dynamic.module';
import { AppInitService } from './core/service/app.init.service';
import { EncryptDecryptComponent } from './custom-components/encrypt-decrypt/encrypt-decrypt.component';
import { SwiperModule } from 'swiper/angular';
import { TransactionRoutingModule } from './transaction/transaction-routing.module';
import { TransactionModule } from './transaction/transaction.module';
import { InventoryModule } from './inventory/inventory.module';
import { MasterModule } from './master/master.module';
import {TokenModule} from './token/token.module'
import { ToastrModule } from 'ngx-toastr';
import { SelectTokenComponent } from './select-token/select-token.component';
import { ReportsModule } from './reports/reports.module';
import { DirectAccessoryModule } from './direct-accessory/direct-accessory.module';
import { TicketingSystemModule } from './ticketing-system/ticketing-system.module';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.init();
  };
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageLoaderComponent,
    SidebarComponent,
    RightSidebarComponent,
    AuthLayoutComponent,
    MainLayoutComponent,
    EncryptDecryptComponent,
    SelectTokenComponent,
    
    
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    DirectAccessoryModule,
    PerfectScrollbarModule,
    NgxSpinnerModule,
    NgIdleKeepaliveModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    CoreModule,
    DynamicModule,
    SharedModule,
    SwiperModule,
    TransactionRoutingModule,
    TransactionModule,
    TicketingSystemModule,
    InventoryModule,
    MasterModule,
    TokenModule,
    ReportsModule,
  ],

  providers: [
    DatePipe,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    fakeBackendProvider,
    WINDOW_PROVIDERS
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
