import { Injectable } from "@angular/core";
import { Router, Routes } from "@angular/router";
import { AuthGuard } from "../guard/auth.guard";
import { MainLayoutComponent } from "../../layout/app-layout/main-layout/main-layout.component";
import { Page404Component } from "src/app/authentication/page404/page404.component";
import { AppRouter } from "src/app/config/comman.const";
import { SubmenuComponent } from "src/app/custom-components/submenu/submenu.component";
import { ProfileSettingComponent } from "src/app/custom-components/profile-setting/profile-setting.component";
import { CrmResolverService } from "./crm-resolver.service";
import { CallLoginDashboardComponent } from "src/app/custom-components/call-login-dashboard/call-login-dashboard.component";
import { AssignTechnicianComponent } from "src/app/custom-components/assign-technician/assign-technician.component";
import { CreateJobCustomerComponent } from "src/app/custom-components/create-job-customer/create-job-customer.component";
import { CreateCustomerComponent } from "src/app/custom-components/create-customer/create-customer.component";
import { RepairProcessComponent } from "src/app/transaction/repair-process/repair-process.component";
import { TokenGenerationComponent } from "../../token/token-generation/token-generation.component";
import { CreateTokenComponent } from "../../token/create-token/create-token.component";
import { TokenDisplayComponent } from "src/app/token/token-display/token-display.component";
import { UserFormComponent } from "src/app/custom-components/user-form/user-form.component";
import { StockOrderComponent } from "src/app/inventory/stock-order/stock-order.component";
import { BulkReturnOrderComponent } from "src/app/inventory/bulk-return-order/bulk-return-order.component";
import { ConsignmentDeliveryComponent } from "src/app/inventory/consignment-delivery/consignment-delivery.component";
import { OrderSummaryListComponent } from "src/app/inventory/order-summary-list/order-summary-list.component";
import { BulkReturnListComponent } from "src/app/inventory/bulk-return-list/bulk-return-list.component";
import { PendingAcknowledgeComponent } from "src/app/inventory/pending-acknowledge/pending-acknowledge.component";
import { AddUserMasterComponent } from "src/app/master/user-master/add-user-master/add-user-master.component";
import { UserMasterComponent } from "src/app/master/user-master/user-master.component";
import { AddCompanyMaterialResourceMappingComponent } from "src/app/master/company-material-resource-mapping/add-company-material-resource-mapping/add-company-material-resource-mapping.component";
import { CompanyMaterialResourceMapping } from "src/app/master/company-material-resource-mapping/company-material-resource-mapping.component";
import { AddGstComponentComponent } from "src/app/master/gst-component/add-gst-component/add-gst-component.component";
import { GstComponentComponent } from "src/app/master/gst-component/gst-component.component";
import { AddGstGroupComponent } from "src/app/master/gst-group/add-gst-group/add-gst-group.component";
import { GstGroupComponent } from "src/app/master/gst-group/gst-group.component";
import { AddGstSetupComponent } from "src/app/master/gst-setup/add-gst-setup/add-gst-setup.component";
import { GstSetupComponent } from "src/app/master/gst-setup/gst-setup.component";
import { AddLocationMasterComponent } from "src/app/master/location-master/add-location-master/add-location-master.component";
import { LocationMasterComponent } from "src/app/master/location-master/location-master.component";
import { AddMaterialMasterComponent } from "src/app/master/material-master/add-material-master/add-material-master.component";
import { MaterialMasterComponent } from "src/app/master/material-master/material-master.component";
import { AddResourceMasterComponent } from "src/app/master/resource-master/add-resource-master/add-resource-master.component";
import { ResourceMasterComponent } from "src/app/master/resource-master/resource-master.component";
import { MasterContentComponent } from "src/app/master/master-content/master-content.component";
import { CustomerMasterComponent } from "src/app/master/customer-master/customer-master.component";
import { AddCustomerComponent } from "src/app/custom-components/create-customer/add-customer/add-customer.component";
import { AddCustomerMasterComponent } from "src/app/master/customer-master/add-customer-master/add-customer-master.component";
import { UserLocationMappingComponent } from "src/app/master/user-location-mapping/user-location-mapping.component";
import { AddUserLocationMappingComponent } from "src/app/master/user-location-mapping/add-user-location-mapping/add-user-location-mapping.component";
import { ConsignmentOrderListComponent } from "src/app/inventory/consignment-order-list/consignment-order-list.component";
import { OpeningStockComponent } from "src/app/inventory/opening-stock/opening-stock.component";
import { OpeningStockListComponent } from "src/app/inventory/opening-stock-list/opening-stock-list.component";
import * as glob from "../../config/global";
import { JobReportComponent } from "src/app/reports/job-report/job-report.component";
import { TokenReportComponent } from "src/app/reports/token-report/token-report.component";
import { AccessorySalesComponent } from "src/app/inventory/accessory-sales/accessory-sales.component";
import { StockTransferOrderListComponent } from "src/app/inventory/stock-transfer-order-list/stock-transfer-order-list.component";
import { StockTransferOrderComponent } from "src/app/inventory/stock-transfer-order/stock-transfer-order.component";
import { GoodsMovementComponent } from "src/app/inventory/goods-movement/goods-movement.component";
import { GoodsMovementListComponent } from "src/app/inventory/goods-movement-list/goods-movement-list.component";
import { AccessorySalesListComponent } from "src/app/inventory/accessory-sales/accessory-sales-list/accessory-sales-list.component";
import { SalesReportComponent } from "src/app/reports/sales-report/sales-report.component";
import { SalesReturnListComponent } from "src/app/inventory/sales-return-list/sales-return-list.component";
import { SalesReturnComponent } from "src/app/inventory/sales-return/sales-return.component";
import { OrgRoleMasterComponent } from "src/app/master/org-role-master/org-role-master.component";
import { AddOrgRoleMasterComponent } from "src/app/master/org-role-master/add-org-role-master/add-org-role-master.component";
import { JobroleMasterComponent } from "src/app/master/jobrole-master/jobrole-master.component";
import { AddJobroleMasterComponent } from "src/app/master/jobrole-master/add-jobrole-master/add-jobrole-master.component";
import { ProfileMasterComponent } from "src/app/master/profile-master/profile-master.component";
import { AddProfileMasterComponent } from "src/app/master/profile-master/add-profile-master/add-profile-master.component";
import { ProfileModuleMasterComponent } from "src/app/master/profile-module-master/profile-module-master.component";
import { AddProfileModuleMasterComponent } from "src/app/master/profile-module-master/add-profile-module-master/add-profile-module-master.component";
import { SalespersonMasterComponent } from "src/app/master/salesperson-master/salesperson-master.component";
import { AddSalespersonMasterComponent } from "src/app/master/salesperson-master/add-salesperson-master/add-salesperson-master.component";
import { PaymentReportComponent } from "src/app/reports/payment-report/payment-report.component";
import { RefundListComponent } from "src/app/inventory/refund-list/refund-list.component";
import { RefundOrderComponent } from "src/app/inventory/refund-order/refund-order.component";
import { DiscountCouponListComponent } from "src/app/inventory/accessory-sales/discount-coupon-list/discount-coupon-list.component";
import { DiscountCouponComponent } from "src/app/inventory/accessory-sales/discount-coupon/discount-coupon.component";
import { RefundOrderRequestComponent } from "src/app/inventory/refund-order/refund-order-request/refund-order-request.component";
import { SalesReturnRequestComponent } from "src/app/inventory/sales-return/sales-return-request/sales-return-request.component";
import { AdvancePaymentComponent } from "src/app/inventory/advance-payment/advance-payment.component";
import { AdvancePaymentListComponent } from "src/app/inventory/advance-payment-list/advance-payment-list.component";
import { CashDepositComponent } from "src/app/inventory/cash-deposit/cash-deposit.component";
import { CashDepositListComponent } from "src/app/inventory/cash-deposit/cash-deposit-list/cash-deposit-list.component";
import { CommunicationDetailsReportComponent } from "src/app/reports/communication-details-report/communication-details-report.component";
import { AdvancePaymentReportComponent } from "src/app/reports/advance-payment-report/advance-payment-report.component";
import { CashDepositReportComponent } from "src/app/reports/cash-deposit-report/cash-deposit-report.component";
import { RefundOrderCreatedComponent } from "src/app/inventory/refund-order/refund-order-created/refund-order-created.component";
import { SalesReturnCreatedComponent } from "src/app/inventory/sales-return/sales-return-created/sales-return-created.component";
import { IncomingInvoiceListComponent } from "src/app/inventory/incoming-invoice-list/incoming-invoice-list.component";
import { IncomingInvoiceComponent } from "src/app/inventory/incoming-invoice/incoming-invoice.component";
import { BulkReturnReportComponent } from "src/app/reports/bulk-return-report/bulk-return-report.component";
import { MaterialPriceDetailsComponent } from "src/app/master/material-master/material-price-details/material-price-details.component";
import { CustomerJourneyReportComponent } from "src/app/reports/customer-journey-report/customer-journey-report.component";
import { DailySummaryReportComponent } from "src/app/reports/daily-summary-report/daily-summary-report.component";
import { StockReportComponent } from "src/app/reports/stock-report/stock-report.component";
import { DirectSalesComponent } from "src/app/direct-accessory/direct-sales/direct-sales.component";
import { PinelabReportComponent } from "src/app/reports/pinelab-report/pinelab-report.component";
import { CancellationComponent } from "src/app/inventory/cancellation/cancellation.component";
import { CancelAdvanceComponent } from "src/app/inventory/cancellation/cancel-advance/cancel-advance.component";
import { CashRegisterReportComponent } from "src/app/reports/cash-register-report/cash-register-report.component";
import { IncomingInvoiceReportComponent } from "src/app/reports/incoming-invoice-report/incoming-invoice-report.component";
import { OpenJobReportComponent } from "src/app/reports/open-job-report/open-job-report.component";
import { UnclaimedDeviceComponent } from "src/app/inventory/unclaimed-device/unclaimed-device.component";
import { CreditRequestMasterComponent } from "src/app/master/credit-request-master/credit-request-master.component";
import { AddCreditRequestMasterComponent } from "src/app/master/credit-request-master/add-credit-request-master/add-credit-request-master.component";
import { UnclaimedDeviceListComponent } from "src/app/inventory/unclaimed-device/unclaimed-device-list/unclaimed-device-list.component";
import { InvoicePaymentChangeComponent } from "src/app/inventory/accessory-sales/invoice-payment-change/invoice-payment-change.component";
import { PriceListComponent } from "src/app/master/price-list/price-list.component";
import { AddPriceListComponent } from "src/app/master/price-list/add-price-list/add-price-list.component";
import { BulletinBoardComponent } from "src/app/inventory/bulletin-board/bulletin-board.component";
import { LeadManagementListComponent } from "src/app/inventory/lead-management-list/lead-management-list.component";
import { DiscountKittyComponent } from "src/app/inventory/discount-kitty/discount-kitty.component";
import { AddDiscountKittyComponent } from "src/app/inventory/discount-kitty/add-discount-kitty/add-discount-kitty.component";
import { DropoffManagementListComponent } from "src/app/inventory/dropoff-management-list/dropoff-management-list.component";
import { DropoffManagementComponent } from "src/app/inventory/dropoff-management/dropoff-management.component";
import { TokenCasaComponent } from "src/app/token/token-casa/token-casa.component";
import { LeadManagementComponent } from "src/app/inventory/lead-management/lead-management.component";
import { ConsignmentScanComponent } from "src/app/inventory/consignment-scan/consignment-scan.component";
import { ReservationDashboardComponent } from "src/app/token/reservation/reservation-dashboard.component";
import { AddReservationComponent } from "src/app/token/reservation/add-reservation/add-reservation.component";
import { EscalationTrackerListComponent } from "src/app/inventory/escalation-tracker-list/escalation-tracker-list.component";
import { EscalationTrackerComponent } from "src/app/inventory/escalation-tracker/escalation-tracker.component";
import { NretManagementListComponent } from "src/app/inventory/nret-management/nret-management-list/nret-management-list.component";
import { NretManagementComponent } from "src/app/inventory/nret-management/nret-management.component";
import { AppleRegistryListComponent } from "src/app/inventory/apple-registry/apple-registry-list/apple-registry-list.component";
import { AppleRegistryComponent } from "src/app/inventory/apple-registry/apple-registry.component";
import { CustomerLedgerReportComponent } from "src/app/reports/customer-ledger-report/customer-ledger-report.component";
import { ContractMasterComponent } from "src/app/master/contract-master/contract-master.component";
import { AddContractMasterComponent } from "src/app/master/contract-master/add-contract-master/add-contract-master.component";
import { AddBulletinBoardComponent } from "src/app/inventory/bulletin-board/add-bulletin-board/add-bulletin-board.component";
import { CancellationViewComponent } from "src/app/inventory/cancellation-view/cancellation-view.component";
import { ApproverSettingMasterComponent } from "src/app/master/approver-setting-master/approver-setting-master.component";
import { AddApproverSettingMasterComponent } from "src/app/master/approver-setting-master/add-approver-setting-master/add-approver-setting-master.component";
import { HappyCallingComponent } from "src/app/inventory/happy-calling/happy-calling.component";
import { HappyCallingListComponent } from "src/app/inventory/happy-calling/happy-calling-list/happy-calling-list.component";
import { LeadManagementReportComponent } from "src/app/reports/lead-management-report/lead-management-report.component";
import { ReservationReportComponent } from "src/app/reports/reservation-report/reservation-report.component";
import { PartialAdvanceReportComponent } from "src/app/reports/partial-advance-report/partial-advance-report.component";
import { OnsiteProcessComponent } from "src/app/transaction/onsite-process/onsite-process.component";
import { OnsiteProcessListComponent } from "src/app/transaction/onsite-process/onsite-process-list/onsite-process-list.component";
import { DropoffManagementPartsComponent } from "src/app/inventory/dropoff-management/dropoff-management-parts/dropoff-management-parts.component";
import { AddDiscountKittyApprovalComponent } from "src/app/inventory/discount-kitty-approval/add-discount-kitty-approval/add-discount-kitty-approval.component";
import { DiscountApproverComponent } from "src/app/authentication/discount-approver/discount-approver.component";
import { DiscountKittyApprovalComponent } from "src/app/inventory/discount-kitty-approval/discount-kitty-approval.component";
import { RefundReportComponent } from "src/app/reports/refund-report/refund-report.component";
import { AssignToMeComponent } from "src/app/transaction/repair-process/pop-up/assign-to-me/assign-to-me.component";
import { ReferralDetailsReportComponent } from "src/app/reports/referral-details-report/referral-details-report.component";
import { ModeOfPaymentPermissionComponent } from "src/app/master/mode-of-payment-permission/mode-of-payment-permission.component";
import { ConsignmentPendingListComponent } from "src/app/inventory/consignment-pending-list/consignment-pending-list.component";
import { AddConsignmentPendingListComponent } from "src/app/inventory/consignment-pending-list/add-consignment-pending-list/add-consignment-pending-list.component";
import { CheckInCheckOutDetailsComponent } from "src/app/master/check-in-check-out-details/check-in-check-out-details.component";
import { CheckInCheckOutReportComponent } from "src/app/reports/check-in-check-out-report/check-in-check-out-report.component";
import { UnclaimedDeviceReportComponent } from "src/app/reports/unclaimed-device-report/unclaimed-device-report.component";
import { ReturnUnclaimedDeviceComponent } from "src/app/inventory/unclaimed-device/return-unclaimed-device/return-unclaimed-device.component";
import { CreateBulkReturnDcComponent } from "src/app/inventory/bulk-return-order-dc-list/create-bulk-return-dc/create-bulk-return-dc.component";
import { BulkReturnOrderDcGridComponent } from "src/app/inventory/bulk-return-order-dc-list/bulk-return-order-dc-grid/bulk-return-order-dc-grid.component";
import { BulkReturnOrderDcListComponent } from "src/app/inventory/bulk-return-order-dc-list/bulk-return-order-dc-list.component";
import { AddToteManagementComponent } from "src/app/master/tote-management/add-tote-management/add-tote-management.component";
import { ToteManagementComponent } from "src/app/master/tote-management/tote-management.component";
import { ToteReportComponent } from "src/app/reports/tote-report/tote-report.component";
import { GsxkbbpartListComponent } from "src/app/inventory/gsxkbbpart-list/gsxkbbpart-list.component";
import { ResetQuotationDetailsComponent } from "src/app/reports/reset-quotation-details/reset-quotation-details.component";
import { ConsignmentLockdateLogsComponent } from "src/app/reports/consignment-lockdate-logs/consignment-lockdate-logs.component";
import { CallManagementListComponent } from "src/app/inventory/call-management-list/call-management-list.component";
import { CallManagementComponent } from "src/app/inventory/call-management/call-management.component";
import { InterCompanyAmountTransferReportComponent } from "src/app/reports/inter-company-amount-transfer-report/inter-company-amount-transfer-report.component";
import { InboundCallManagementReportComponent } from "src/app/reports/inbound-call-management-report/inbound-call-management-report.component";
import { AmcContractManagementListComponent } from "src/app/inventory/amc-contract-management-list/amc-contract-management-list.component";
import { CompanyStockManagementComponent } from "src/app/inventory/company-stock-management/company-stock-management.component";
import { QuotationReportComponent } from "src/app/reports/quotation-report/quotation-report.component";
import { TradeinListComponent } from "src/app/inventory/tradein-list/tradein-list.component";
import { TradeinComponent } from "src/app/inventory/tradein-list/tradein/tradein.component";
import { TicketingSystemComponent } from "src/app/ticketing-system/ticketing-system/ticketing-system.component";
import { TicketingBulkQuotationComponent } from "src/app/ticketing-system/ticketing-system/ticketing-bulk-quotation/ticketing-bulk-quotation.component";
import { TestingComponent } from "src/app/inventory/testing/testing.component";
import { EnquiryListReportComponent } from "src/app/reports/enquiry-list-report/enquiry-list-report.component";

@Injectable({
  providedIn: 'root'
})

export class AppInitService {
  TYPE_MAP = new Map<string, any>();

  constructor(private Router: Router) {}

  userDetails: any[] = []
  setUp(){
    console.log("this.userDetails", this.userDetails)
  }
  

  init() {
    
    return new Promise<void>((resolve, reject) => {
       
      let allRoutes = JSON.parse(sessionStorage.getItem("AllRouting"))
      let formDetail = JSON.parse(sessionStorage.getItem("FieldDetail"));

      let staticRoutes = this.Router.config;
      this.Router.config = [];

      if (allRoutes == null) {
        this.Router.resetConfig(staticRoutes);
        resolve();
      }
      else {
        const dynamicRoutes = allRoutes == undefined ? [] : allRoutes;
        let routes = staticRoutes;
        let childRoutes = [];
        var logedinuser = glob.getLogedInUser()
         ;
        /*if(logedinuser == null || logedinuser==undefined)
        {
          childRoutes.push({
            path: "dashboard", component: CallLoginDashboardComponent,
            data: { ScreenCode: "Dashbord", routeDetail: "", ModuleId: 0 },
            canActivate: [AuthGuard],
          });

        }
      else
      {
        var userdetail = logedinuser.UserDetails
        if(userdetail.MenuGroupId==2)
        {
          childRoutes.push({
            path: "token-generate", component: TokenGenerationComponent,
            data: { ScreenCode: "Token", routeDetail: "", ModuleId: 0 },
            canActivate: [AuthGuard],
          });
  
        }
        else
        {
          childRoutes.push({
            path: "dashboard", component: CallLoginDashboardComponent,
            data: { ScreenCode: "Dashbord", routeDetail: "", ModuleId: 0 },
            canActivate: [AuthGuard],
          });
  
        }
      }*/
      childRoutes.push({
        path: "token-create", component: CreateTokenComponent,
        data: { ScreenCode: "TokenCreate", routeDetail: "", ModuleId: 0 },
        canActivate: [AuthGuard],
      });

      
      childRoutes.push({
        path: "dashboard", component: CallLoginDashboardComponent,
        data: { ScreenCode: "Dashbord", routeDetail: "", ModuleId: 0 },
        canActivate: [AuthGuard]
      });

        /*dynamicRoutes.forEach(route => {
          let moduleId = 0;
          let module = formDetail.find(x => x.ModuleName == route.ScreenCode);
          if (module != undefined) {
            moduleId = module.ModuleId;
          }
          childRoutes.push({
            path: route.Path, component: this.getComponent(route.Component),
            data: { ScreenCode: route.ScreenCode, routeDetail: route, ModuleId: moduleId },
            canActivate: [AuthGuard],
            resolve: {
              ExtraApi: CrmResolverService
            }
          });
        });*/

        let customRoute = this.getCustomComponentRoutes();
        customRoute.forEach(route => {
          childRoutes.push({
            path: route.path, component: route.component,
            data: route.data,
            canActivate: [AuthGuard],
            resolve: {
              ExtraApi: CrmResolverService
            }
          });
        })

        routes = routes.filter(x => x.path != 'auth/:companycode');

        routes.push({
          path: 'auth/:companycode', component: MainLayoutComponent,
          children: childRoutes,
        });

        this.Router.resetConfig(routes);
        resolve();
      }

    });
  }

  initNotFound(companyCode: any) {
    return new Promise<void>((resolve, reject) => {

      let routes = this.Router.config;
      routes = routes.filter(x => x.path != '404/:companycode');
      routes = routes.filter(x => x.path != '**');

      routes.push({
        path: '404/:companycode', component: MainLayoutComponent,
        children: [{ path: '404', component: Page404Component }],
      });

      routes.push({ path: '**', redirectTo: `404/${companyCode}/404` });

      this.Router.resetConfig(routes);
      resolve();
    })
  }

  getComponent(component: any) {
    switch (component) {

      default: {
        return Page404Component;
      }
    }
  }


  getCustomComponentRoutes() {
    let routes: Routes = [

      {
        path: 'UserManagement',
        component: UserFormComponent,
        data: { ScreenCode: 'UserManagement', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
     {
        path: AppRouter.SystemAdministrator + '/' + AppRouter.UserManagement + '/add',
        component: UserFormComponent,
        data: { ScreenCode: 'UserManagement', routeDetail: '', ModuleId: 22 },
        canActivate: [AuthGuard],
      },
      {
        path: AppRouter.SystemAdministrator + '/' + AppRouter.ProfileSetting + '/add',
        component: ProfileSettingComponent,
        data: { ScreenCode: 'ProfileSetting', routeDetail: '', ModuleId: 42 },
        canActivate: [AuthGuard],
      },

      {
        path: AppRouter.SubMenu,
        component: SubmenuComponent,
        data: { ScreenCode: '', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
      {
        path: AppRouter.SystemAdministrator + '/' + AppRouter.ProfileSetting + '/add',
        component: ProfileSettingComponent,
        data: { ScreenCode: 'ProfileSetting', routeDetail: '', ModuleId: 42 },
        canActivate: [AuthGuard],
      },
      {
        path: 'call-login-dashbaord',
        component: CallLoginDashboardComponent,
        data: { ScreenCode: 'call-login-dashbaord', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
      {
        path: 'assign-technician',
        component: AssignTechnicianComponent,
        data: { ScreenCode: 'app-assign-technician', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },

      {
        path: 'customer-list',
        component: CreateCustomerComponent,
        data: { ScreenCode: 'customer-list', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
      { path: 'stock-order-list', 
      component: OrderSummaryListComponent, 
      data: { ScreenCode: 'stock-order-list', routeDetail: '', ModuleId: 38 },
      canActivate: [AuthGuard],
      },
      { path: 'bulk-return-list', 
      component: BulkReturnListComponent, 
      data: { ScreenCode: 'bulk-return-list', routeDetail: '', ModuleId: 37 },
      canActivate: [AuthGuard],
      },
      { path: 'consignment-delivery', 
      component: ConsignmentDeliveryComponent, 
      data: { ScreenCode: 'consignment-delivery', routeDetail: '', ModuleId: 0 },
      canActivate: [AuthGuard],
      },
      { path: 'pending-acknowledge', 
      component: PendingAcknowledgeComponent, 
      data: { ScreenCode: 'pending-acknowledge', routeDetail: '', ModuleId: 98 },
      canActivate: [AuthGuard],
      },
      {
        path: 'create-job-customer',
        component: CreateJobCustomerComponent,
        data: { ScreenCode: 'create-job-customer', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
      {
        path: 'repair-process',
        component: RepairProcessComponent,
        data: { ScreenCode: 'repair-process', routeDetail: '', ModuleId: 0 },
        canActivate: [AuthGuard],
      },
      {
        path: 'token-generate',
        component: TokenGenerationComponent,
        data: {ScreenCode: 'token-generate', routeDetail:'', ModuleId:146}
      },
      {
        path: 'token',
        component: CreateTokenComponent,
        data: {ScreenCode: 'token', routeDetail:'', ModuleId:0}
      },
      {
        path: 'token-display',
        component: TokenDisplayComponent,
        data: {ScreenCode: 'token-display', routeDetail:'', ModuleId: 111}
      },
      {
        path: 'stock-order',
        component: StockOrderComponent,
        data: {ScreenCode: 'stock-order', routeDetail:'', ModuleId:0}
      },
      {
        path: 'bulk-return-order',
        component: BulkReturnOrderComponent,
        data: {ScreenCode: 'bulk-return-order', routeDetail:'', ModuleId:0}
      },
      {
        path: 'consignment-delivery',
        component: ConsignmentDeliveryComponent,
        data: {ScreenCode: 'consignment-delivery', routeDetail:'', ModuleId:0}
      },
      {
        path: 'user-master',
        component: UserMasterComponent,
        data: {ScreenCode: 'user-master', routeDetail:'', ModuleId:0}

      },
      {
        path: 'add-user-master',
        component: AddUserMasterComponent,
        data: {ScreenCode: 'add-user-master', routeDetail:'', ModuleId:0}
      },
      {
        path : 'material',
        component : CompanyMaterialResourceMapping,
        data: {ScreenCode: 'material', routeDetail:'', ModuleId:0}
      },
      {
        path: 'material-master',
        component: MaterialMasterComponent,
        data: {ScreenCode: 'material-master', routeDetail:'', ModuleId:6}
      },
      {
        path: 'add-material-master',
        component: AddMaterialMasterComponent,
        data: {ScreenCode: 'add-material-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'resource-master',
        component: ResourceMasterComponent,
        data: {ScreenCode: 'resource-master', routeDetail:'', ModuleId:9}
      },
      {
        path: 'add-resource-master',
        component: AddResourceMasterComponent,
        data: {ScreenCode: 'add-resource-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'location-master',
        component: LocationMasterComponent,
        data: {ScreenCode: 'location-master', routeDetail:'', ModuleId:125}
        
      },  
      {
        path: 'add-location-master',
        component: AddLocationMasterComponent,
        data: {ScreenCode: 'add-location-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'gst-component',
        component: GstComponentComponent,
        data: {ScreenCode: 'gst-component', routeDetail:'', ModuleId:0}
      },
      {
        path: 'add-gst-component',
        component: AddGstComponentComponent,
        data: {ScreenCode: 'add-gst-component', routeDetail:'', ModuleId:0}
      },
      {
        path: 'gst-group',
        component: GstGroupComponent,
        data: {ScreenCode: 'gst-group', routeDetail:'', ModuleId:70}
      },
      {
        path: 'add-gst-group',
        component: AddGstGroupComponent,
        data: {ScreenCode: 'add-gst-group', routeDetail:'', ModuleId:0}
      },
      {
        path: 'gst-setup',
        component: GstSetupComponent,
        data: {ScreenCode: 'gst-setup', routeDetail:'', ModuleId:71}
      },
      {
        path: 'add-gst-setup',
        component: AddGstSetupComponent,
        data: {ScreenCode: 'add-gst-setup', routeDetail:'', ModuleId:0}
      },
      {
        path: 'company-mapping',
        component: CompanyMaterialResourceMapping,
        data: {ScreenCode: 'company-mapping', routeDetail:'', ModuleId:43}
      },
      {
        path: 'add-company-mapping',
        component: AddCompanyMaterialResourceMappingComponent,
        data: {ScreenCode: 'add-company-mapping', routeDetail:'', ModuleId:0}
      },
      {
        path: 'master-content',
        component: MasterContentComponent,
        data: {ScreenCode: 'master-content', routeDetail:'', ModuleId:0}
      },
      {
        path: 'customer-master',
        component: CustomerMasterComponent,
        data: {ScreenCode: 'customer-master', routeDetail:'', ModuleId:5}
      },
      {
        path: 'add-customer-master',
        component: AddCustomerMasterComponent,
        data: {ScreenCode: 'add-customer-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'user-location-mapping',
        component: UserLocationMappingComponent,
        data: {ScreenCode: 'user-location-mapping', routeDetail:'',ModuleId:147}
      },
      {
        path: 'add-user-location-mapping',
        component: AddUserLocationMappingComponent,
        data: {ScreenCode: 'add-user-location-mapping', routeDetail:'',ModuleId:0}
      },
      {
        path: 'consignment-order-list',
        component: ConsignmentOrderListComponent,
        data: {ScreenCode: 'consignment-order-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'opening-stock-list',
        component: OpeningStockListComponent,
        data: {ScreenCode: 'opening-stock-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'opening-stock',
        component: OpeningStockComponent,
        data: {ScreenCode: 'opening-stock', routeDetail:'',ModuleId: 112}
      },
      
      {
        path: 'goods-movement-list',
        component: GoodsMovementListComponent,
        data: {ScreenCode: 'goods-movement-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'goods-movement',
        component: GoodsMovementComponent,
        data: {ScreenCode: 'goods-movement-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'transfer-order',
        component: StockTransferOrderComponent,
        data: {ScreenCode: 'transfer-order', routeDetail:'',ModuleId:0}
      },
      {
        path: 'transfer-order-list',
        component: StockTransferOrderListComponent,
        data: {ScreenCode: 'transfer-order-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'token-report',
        component: TokenReportComponent,
        data: {ScreenCode: 'token-report', routeDetail:'',ModuleId:148}
      },
      {
        path: 'job-report',
        component: JobReportComponent,
        data: {ScreenCode: 'job-report', routeDetail:'',ModuleId:149}
      },
      {
        path: 'accessory-sales',
        component: AccessorySalesComponent,
        data: {ScreenCode: 'accessory-sales', routeDetail:'',ModuleId:0}
      },
      {
        path: 'accessory-sales-list',
        component: AccessorySalesListComponent,
        data: {ScreenCode: 'accessory-sales-list', routeDetail:'',ModuleId: 114}
      },
      {
        path: 'sales-report',
        component: SalesReportComponent,
        data: {ScreenCode: 'sales-report', routeDetail:'',ModuleId:159}
      },
      {
        path: 'sales-return-list',
        component: SalesReturnListComponent,
        data: {ScreenCode: 'sales-return-list', routeDetail:'',ModuleId:156}
      },
      {
        path: 'sales-return',
        component: SalesReturnComponent,
        data: {ScreenCode: 'sales-return', routeDetail:'',ModuleId:163}
      },
      {
        path: 'sales-return-request',
        component: SalesReturnRequestComponent,
        data: {ScreenCode: 'sales-return-request', routeDetail:'',ModuleId:162}
      },
      {
        path: 'org-role-master',
        component: OrgRoleMasterComponent,
        data: {ScreenCode: 'org-role-master', routeDetail:'',ModuleId:23}
      },
      {
        path: 'add-org-role-master',
        component: AddOrgRoleMasterComponent,
        data: {ScreenCode: 'add-org-role-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'jobrole-master',
        component: JobroleMasterComponent,
        data: {ScreenCode: 'jobrole-master', routeDetail:'',ModuleId:24}
      },
      {
        path: 'add-jobrole-master',
        component: AddJobroleMasterComponent,
        data: {ScreenCode: 'add-jobrole-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'profile-master',
        component: ProfileMasterComponent,
        data: {ScreenCode: 'profile-master', routeDetail:'',ModuleId: 42}
      },
      {
        path: 'add-profile-master',
        component: AddProfileMasterComponent,
        data: {ScreenCode: 'add-profile-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'profile-module-master',
        component: ProfileModuleMasterComponent,
        data: {ScreenCode: 'profile-module-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'add-profile-module-master',
        component: AddProfileModuleMasterComponent,
        data: {ScreenCode: 'add-profile-module-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'salesperson-master',
        component: SalespersonMasterComponent,
        data: {ScreenCode: 'salesperson-master', routeDetail:'', ModuleId:0}
      },

      {
        path: 'add-salesperson-master',
        component: AddSalespersonMasterComponent,
        data: {ScreenCode: 'add-salesperson-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'payment-report',
        component: PaymentReportComponent,
        data: {ScreenCode: 'payment-report', routeDetail:'', ModuleId: 160}
      },

      {
        path: 'add-salesperson-master',
        component: AddSalespersonMasterComponent,
        data: {ScreenCode: 'add-salesperson-master', routeDetail:'', ModuleId:0}
      },
      {
        path: 'payment-report',
        component: PaymentReportComponent,
        data: {ScreenCode: 'payment-report', routeDetail:'', ModuleId:0}
      },
      {
        path: 'refund-list',
        component: RefundListComponent,
        data: {ScreenCode: 'refund-list', routeDetail:'',ModuleId:157}
      },
      {
        path: 'refund-order',
        component: RefundOrderComponent,
        data: {ScreenCode: 'refund-order', routeDetail:'',ModuleId:166}
      },
      {
        path: 'refund-order-created',
        component: RefundOrderCreatedComponent,
        data: {ScreenCode: 'refund-order-created', routeDetail:'',ModuleId:0}
      },
      {
        path: 'refund-order-request',
        component: RefundOrderRequestComponent,
        data: {ScreenCode: 'refund-order-request', routeDetail:'',ModuleId:165}
      },
      
      {
        path: 'discount-coupon-list',
        component: DiscountCouponListComponent,
        data: {ScreenCode: 'discount-coupon-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'discount-coupon',
        component: DiscountCouponComponent,
        data: {ScreenCode: 'discount-coupon', routeDetail:'',ModuleId:0}
      },
      {
        path: 'sales-return-created',
        component: SalesReturnCreatedComponent,
        data: {ScreenCode: 'sales-return-created', routeDetail:'',ModuleId:0}
      },
      {
        path: 'advance-payment',
        component: AdvancePaymentComponent,
        data: {ScreenCode: 'advance-payment', routeDetail:'',ModuleId:173}
      },
      {
        path: 'advance-payment-list',
        component: AdvancePaymentListComponent,
        data: {ScreenCode: 'advance-payment-list', routeDetail:'',ModuleId:174}
      },
      {
        path: 'cash-deposit',
        component: CashDepositComponent,
        data: {ScreenCode: 'cash-deposit', routeDetail:'',ModuleId:171}
      },
      {
        path: 'cash-deposit-list',
        component: CashDepositListComponent,
        data: {ScreenCode: 'cash-deposit-list', routeDetail:'',ModuleId:172}
      },
      {
        path: 'communication-details-report',
        component: CommunicationDetailsReportComponent,
        data: {ScreenCode: 'communication-details-report', routeDetail:'',ModuleId:175}
      },
      {
        path: 'advance-payment-report',
        component: AdvancePaymentReportComponent,
        data: {ScreenCode: 'advance-payment-report', routeDetail:'',ModuleId:176}
      },
      {
        path: 'cash-deposit-report',
        component: CashDepositReportComponent,
        data: {ScreenCode: 'cash-deposit-report', routeDetail:'',ModuleId:177}
      },
      {
        path: 'incoming-invoice-list',
        component: IncomingInvoiceListComponent,
        data: {ScreenCode: 'incoming-invoice-list', routeDetail:'',ModuleId:183}
      },
      {
        path: 'incoming-invoice',
        component: IncomingInvoiceComponent,
        data: {ScreenCode: 'incoming-invoice', routeDetail:'',ModuleId:184}
      },
      {
        path: 'stock-report',
        component: StockReportComponent,
        data: {ScreenCode: 'stock-report', routeDetail:'',ModuleId: 178}
      },
      {
        path: 'bulk-return-report',
        component: BulkReturnReportComponent,
        data: {ScreenCode: 'bulk-return-report', routeDetail:'',ModuleId:179}
      },
      {
        path: 'material-price-details',
        component: MaterialPriceDetailsComponent,
        data: {ScreenCode: 'material-price-details', routeDetail:'',ModuleId:0}
      },
      {
        path: 'customer-journey-report',
        component: CustomerJourneyReportComponent,
        data: {ScreenCode: 'customer-journey-report', routeDetail:'',ModuleId: 180}
      },
      {
        path: 'daily-summary-report',
        component: DailySummaryReportComponent,
        data: {ScreenCode: 'daily-summary-report', routeDetail:'',ModuleId: 181}
      },
      {
        path: 'direct-accessory',
        component: DirectSalesComponent,
        data: {ScreenCode: 'direct-accessory', routeDetail:'',ModuleId: 182}
      },
      {
        path: 'pinelabs-report',
        component: PinelabReportComponent,
        data: {ScreenCode: 'pinelabs-report', routeDetail:'',ModuleId:0}
      },
      {
        path: 'cancel-invoice',
        component: CancellationComponent,
        data: {ScreenCode: 'cancel-invoice', routeDetail:'',ModuleId:0}
      },
      {
        path: 'cancel-advance',
        component: CancelAdvanceComponent,
        data: {ScreenCode: 'cancel-advance', routeDetail:'',ModuleId:0}
      },
      {
        path: 'incoming-invoice-report',
        component: IncomingInvoiceReportComponent,
        data: {ScreenCode: 'incoming-invoice-report', routeDetail:'',ModuleId:185}
      },
      {
        path: 'open-job-report',
        component: OpenJobReportComponent,
        data: {ScreenCode: 'open-job-report', routeDetail:'',ModuleId:186}
      },
      {
        path: 'unclaimed-device',
        component: UnclaimedDeviceComponent,
        data: {ScreenCode: 'unclaimed-device', routeDetail:'',ModuleId:188}
      },
      {
        path: 'unclaimed-device-list',
        component: UnclaimedDeviceListComponent,
        data: {ScreenCode: 'unclaimed-device-list', routeDetail:'',ModuleId: 187}
      },
      {
        path: 'credit-request-master',
        component: CreditRequestMasterComponent,
        data: {ScreenCode: 'credit-request-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'add-credit-request-master',
        component: AddCreditRequestMasterComponent,
        data: {ScreenCode: 'add-credit-request-master', routeDetail:'',ModuleId:0}
      },
      {
        path: 'invoice-payment-change',
        component: InvoicePaymentChangeComponent,
        data: {ScreenCode: 'invoice-payment-change', routeDetail:'',ModuleId:0}
      },
      {
        path: 'price-list',
        component: PriceListComponent,
        data: {ScreenCode: 'price-list', routeDetail:'',ModuleId:189}
      },
      {
        path: 'add-price-list',
        component: AddPriceListComponent,
        data: {ScreenCode: 'add-price-list', routeDetail:'',ModuleId:0}
      },      
      {
        path: 'bulletin-board',
        component: BulletinBoardComponent,
        data: {ScreenCode: 'bulletin-board', routeDetail:'',ModuleId:190}
      },    
      {
        path: 'add-bulletin-board',
        component: AddBulletinBoardComponent,
        data: {ScreenCode: 'add-bulletin-board', routeDetail:'',ModuleId:0}
      },  
      {
        path: 'lead-management-list',
        component: LeadManagementListComponent,
        data: {ScreenCode: 'lead-management-list', routeDetail:'',ModuleId:191}
      }, 
      {
        path: 'lead-management',
        component: LeadManagementComponent,
        data: {ScreenCode: 'lead-management', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'lead-management-report',
        component: LeadManagementReportComponent,
        data: {ScreenCode: 'lead-management-report', routeDetail:'',ModuleId:205}
      }, 
      {
        path: 'discount-kitty-list',
        component: DiscountKittyComponent,
        data: {ScreenCode: 'discount-kitty-list', routeDetail:'',ModuleId:192}
      }, 
      {
        path: 'add-discount-kitty',
        component: AddDiscountKittyComponent,
        data: {ScreenCode: 'add-discount-kitty', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'add-discount-kitty',
        component: AddDiscountKittyComponent,
        data: {ScreenCode: 'add-discount-kitty', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'dropoff-management-list',
        component: DropoffManagementListComponent,
        data: {ScreenCode: 'dropoff-management-list', routeDetail:'',ModuleId:193}
      },
      {
        path: 'dropoff-management',
        component: DropoffManagementComponent,
        data: {ScreenCode: 'dropoff-management', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'dropoff-management-parts',
        component: DropoffManagementPartsComponent,
        data: {ScreenCode: 'dropoff-management-parts', routeDetail:'',ModuleId:0}
      },   
      {
        path: 'token-casa',
        component: TokenCasaComponent,
        data: {ScreenCode: 'token-casa', routeDetail:'',ModuleId:0}
      },  
      {
        path: 'consignment-scan',
        component: ConsignmentScanComponent,
        data: {ScreenCode: 'consignment-scan', routeDetail:'',ModuleId:194}
      },  
      {
        path: 'reservation-dashboard',
        component: ReservationDashboardComponent,
        data: {ScreenCode: 'reservation-dashboard', routeDetail:'',ModuleId:195}
      },
      {
        path: 'reservation',
        component: AddReservationComponent,
        data: {ScreenCode: 'add-reservation', routeDetail:'',ModuleId:0}
      },
        {
        path: 'reservation-report',
        component: ReservationReportComponent,
        data: {ScreenCode: 'reservation-report', routeDetail:'',ModuleId:206}
      },
      {
        path: 'escalation-tracker-list',
        component: EscalationTrackerListComponent,
        data: {ScreenCode: 'escalation-tracker-list', routeDetail:'',ModuleId:195}
      },
      {
        path: 'escalation-tracker',
        component: EscalationTrackerComponent,
        data: {ScreenCode: 'escalation-tracker', routeDetail:'',ModuleId:0}
      },
      {
        path: 'nret-management-list',
        component: NretManagementListComponent,
        data: {ScreenCode: 'nret-management-list', routeDetail:'',ModuleId:196}
      },
      {
        path: 'nret-management',
        component: NretManagementComponent,
        data: {ScreenCode: 'nret-management', routeDetail:'',ModuleId:0}
      },
      {
        path: 'apple-registry-list',
        component: AppleRegistryListComponent,
        data: {ScreenCode: 'apple-registry-list', routeDetail:'',ModuleId:197}
      },
      {
        path: 'apple-registry',
        component: AppleRegistryComponent,
        data: {ScreenCode: 'apple-registry', routeDetail:'',ModuleId:0}
      },
      {
        path: 'reservation-list',
        component: ReservationDashboardComponent,
        data: {ScreenCode: 'reservation-list', routeDetail:'',ModuleId:198}
      },
      
      {
        path: 'cash-register-report',
        component: CashRegisterReportComponent,
        data: {ScreenCode: 'cash-register-report', routeDetail:'',ModuleId:199}
      },
      {
        path: 'customer-ledger-report',
        component: CustomerLedgerReportComponent,
        data: {ScreenCode: 'customer-ledger-report', routeDetail:'',ModuleId:200}
      },
      {
        path: 'credit-request-master',
        component: CreditRequestMasterComponent,
        data: {ScreenCode: 'credit-request-master', routeDetail:'', ModuleId: 201 }
      },
      {
        path: 'add-credit-request',
        component: AddCreditRequestMasterComponent,
        data: {ScreenCode: 'add-credit-request', routeDetail:'', ModuleId: 0 }
      },
      {
        path: 'contract-master',
        component: ContractMasterComponent,
        data: {ScreenCode: 'contract-master', routeDetail:'', ModuleId: 202 }
      },
      {
        path: 'add-contract-master',
        component: AddContractMasterComponent,
        data: {ScreenCode: 'add-contract-master', routeDetail:'', ModuleId: 0 }
      },
      {
        path: 'cancellation-view',
        component: CancellationViewComponent,
        data: {ScreenCode: 'cancellation-view', routeDetail:'', ModuleId: 0 }
      },
      {
        path: 'approval-setting-master',
        component: ApproverSettingMasterComponent,
        data: {ScreenCode: 'approval-setting-master', routeDetail:'', ModuleId: 203 }
      },
      {
        path: 'add-approval-setting-master',
        component: AddApproverSettingMasterComponent,
        data: {ScreenCode: 'add-approval-setting-master', routeDetail:'', ModuleId: 0 }
      },
      {
        path: 'happy-calling-list',
        component: HappyCallingListComponent,
        data: {ScreenCode: 'happy-calling-list', routeDetail:'',ModuleId:204}
      }, 
      {
        path: 'happy-calling',
        component: HappyCallingComponent,
        data: {ScreenCode: 'happy-calling', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'partial-advance-report',
        component: PartialAdvanceReportComponent,
        data: {ScreenCode: 'partial-advance-report', routeDetail:'',ModuleId:207}
      }, 
      {
        path: 'onsite-list',
        component: OnsiteProcessListComponent,
        data: {ScreenCode: 'onsite-list', routeDetail:'',ModuleId: 208 }
      }, 
      {
        path: 'onsite-process',
        component: OnsiteProcessComponent,
        data: {ScreenCode: 'onsite-process', routeDetail:'',ModuleId:0}
      }, 
      {
        path: 'discount-kitty-approval-list',
        component: DiscountKittyApprovalComponent,
        data: {ScreenCode: 'discount-kitty-approval-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'discount-kitty-approval',
        component: AddDiscountKittyApprovalComponent,
        data: {ScreenCode: 'discount-kitty-approval', routeDetail:'',ModuleId:0}
      },
      {
        path: 'refund-report',
        component: RefundReportComponent,
        data: {ScreenCode: 'refund-report', routeDetail:'',ModuleId:209}
      },


      {
        path: 'assign-to-me',
        component: AssignToMeComponent,
        data: {ScreenCode: 'assign-to-me', routeDetail:'',ModuleId:209}
      },
      {
        path: 'referral-details-report',
        component: ReferralDetailsReportComponent,
        data: {ScreenCode: 'referral-details-report', routeDetail:'',ModuleId:210}
      },
      {
        path: 'mode-of-payment-permission',
        component: ModeOfPaymentPermissionComponent,
        data: {ScreenCode: 'mode-of-payment-permission', routeDetail:'',ModuleId:0}
      },
        {
        path: 'consignment-pending-list',
        component: ConsignmentPendingListComponent,
        data: {ScreenCode: 'consignment-pending-list', routeDetail:'',ModuleId:211}
      },
      {
        path: 'add-consignment-pending-list',
        component: AddConsignmentPendingListComponent,
        data: {ScreenCode: 'add-consignment-pending-list', routeDetail:'',ModuleId:211}
      },
      {
        path: 'check-in-check-out-details',
        component: CheckInCheckOutDetailsComponent,
        data: {ScreenCode: 'check-in-check-out-details', routeDetail:'',ModuleId:211}
      },
      {
        path: 'check-in-check-out-report',
        component: CheckInCheckOutReportComponent,
        data: {ScreenCode: 'check-in-check-out-report', routeDetail:'',ModuleId:211}
      },
      {
        path: 'unclaimed-device-report',
        component: UnclaimedDeviceReportComponent,
        data: {ScreenCode: 'unclaimed-device-report', routeDetail:'',ModuleId:214}
      },
      {
        path: 'return-unclaimed-device',
        component: ReturnUnclaimedDeviceComponent,
        data: {ScreenCode: 'return-unclaimed-device', routeDetail:'',ModuleId:214}
      },
      {
        path: 'create-bulk-return-dc',
        component: CreateBulkReturnDcComponent,
        data: {ScreenCode: 'create-bulk-return-dc', routeDetail:'',ModuleId:0}
      },
      {
        path: 'bulk-return-order-dc-grid',
        component: BulkReturnOrderDcGridComponent,
        data: {ScreenCode: 'bulk-return-order-dc-grid', routeDetail:'',ModuleId:0}
      },
      {
        path: 'bulk-return-order-dc-list',
        component: BulkReturnOrderDcListComponent,
        data: {ScreenCode: 'bulk-return-order-dc-list', routeDetail:'',ModuleId:0}
      },
      {
        path: 'add-tote-management',
        component: AddToteManagementComponent,
        data: {ScreenCode: 'add-tote-management', routeDetail:'',ModuleId:0}
      },
      {
        path: 'tote-management',
        component: ToteManagementComponent,
        data: {ScreenCode: 'tote-management', routeDetail:'',ModuleId:0}
      },
      {
        path: 'tote-report',
        component: ToteReportComponent,
        data: {ScreenCode: 'tote-report', routeDetail:'',ModuleId:0}
      },
      {
        path: 'gsxkbbpart-list',
        component: GsxkbbpartListComponent,
        data: {ScreenCode: 'gsxkbbpart-list', routeDetail:'',ModuleId:0}
      },

      {
        path: 'consignment-lockdate-logs',
        component: ConsignmentLockdateLogsComponent,
        data: { ScreenCode: 'consignment-lockdate-logs', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'reset-quotation-details',
        component: ResetQuotationDetailsComponent,
        data: { ScreenCode: 'reset-quotation-details', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'call-management-list',
        component: CallManagementListComponent,
        data: { ScreenCode: 'call-management-list', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'call-management',
        component: CallManagementComponent ,
        data: { ScreenCode: 'call-management', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'inter-company-amount-transfer-report',
        component: InterCompanyAmountTransferReportComponent ,
        data: { ScreenCode: 'inter-company-amount-transfer-report', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'inbound-call-management-report',
        component: InboundCallManagementReportComponent ,
        data: { ScreenCode: 'inbound-call-management-report', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'amc-contract-management-list',
        component: AmcContractManagementListComponent ,
        data: { ScreenCode: 'amc-contract-management-list', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'company-stock-management',
        component: CompanyStockManagementComponent ,
        data: { ScreenCode: 'company-stock-management', routeDetail: '', ModuleId: 0 }
      },
         {
        path: 'quotation-report',
        component: QuotationReportComponent ,
        data: { ScreenCode: 'quotation-report', routeDetail: '', ModuleId: 225 }
      },

           {
        path: 'tradein-list',
        component: TradeinListComponent ,
        data: { ScreenCode: 'tradein-list', routeDetail: '', ModuleId: 0  }
      },
         {
        path: 'tradein',
        component: TradeinComponent ,
        data: { ScreenCode: 'tradein', routeDetail: '', ModuleId: 0 }
      },
      {
        path: 'ticketing-system',
        component: TicketingSystemComponent,
        data: { ScreenCode: 'ticketing-system', routeDetail: '', ModuleId: 0 },
      },
      {
        path: 'ticketing-bulk-quotation',
        component: TicketingBulkQuotationComponent,
        data: { ScreenCode: 'ticketing-bulk-quotation', routeDetail: '', ModuleId: 225 }
      },
      {
        path: 'testing',
        component: TestingComponent,
        data: { ScreenCode: 'testing', routeDetail: '', ModuleId: 0 }
      },
        {
        path: 'enquiry-list-report',
        component: EnquiryListReportComponent,
        data: { ScreenCode: 'enquiry-list-report', routeDetail: '', ModuleId: 227 }
      },

    ]
    return routes;
  }
}

