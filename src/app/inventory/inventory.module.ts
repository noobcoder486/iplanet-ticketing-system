import { SptonSharedModule } from '../shared/spton-shared.module';
import { MaterialModule } from '../shared/material.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { PartSelectorComponent } from './part-selector/part-selector.component';
import { StockOrderComponent } from './stock-order/stock-order.component';
import { ConsignmentDeliveryComponent } from './consignment-delivery/consignment-delivery.component';
import { BulkReturnOrderComponent } from './bulk-return-order/bulk-return-order.component';
import { BulkPartSelectorComponent } from './bulk-part-selector/bulk-part-selector.component';
import { OrderSummaryListComponent } from './order-summary-list/order-summary-list.component';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { PendingAcknowledgeComponent } from './pending-acknowledge/pending-acknowledge.component';
import { BulkReturnListComponent } from './bulk-return-list/bulk-return-list.component';
import { BulkReturnGridComponent } from './bulk-return-list/bulk-return-grid/bulk-return-grid.component';
import { ConsignmentOrderListComponent } from './consignment-order-list/consignment-order-list.component';
import { OpeningStockComponent } from './opening-stock/opening-stock.component';
import { OpeningStockListComponent } from './opening-stock-list/opening-stock-list.component';
import { AccessorySalesComponent } from './accessory-sales/accessory-sales.component';
import { StockTransferOrderComponent } from './stock-transfer-order/stock-transfer-order.component';
import { StockTransferOrderListComponent } from './stock-transfer-order-list/stock-transfer-order-list.component';
import { GoodsMovementComponent } from './goods-movement/goods-movement.component';
import { GoodsMovementListComponent } from './goods-movement-list/goods-movement-list.component';
import { InvoiceSalesStockSelectorComponent } from './invoice-sales-stock-selector/invoice-sales-stock-selector.component';
import { AccessorySalesListComponent } from './accessory-sales/accessory-sales-list/accessory-sales-list.component';
import { DiscountCouponListComponent } from './accessory-sales/discount-coupon-list/discount-coupon-list.component';
import { DiscountCouponComponent } from './accessory-sales/discount-coupon/discount-coupon.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';
import { AdvancePaymentListComponent } from './advance-payment-list/advance-payment-list.component';
import { CashDepositComponent } from "src/app/inventory/cash-deposit/cash-deposit.component";
import { CashDepositListComponent } from "src/app/inventory/cash-deposit/cash-deposit-list/cash-deposit-list.component";
import { IncomingInvoiceComponent } from './incoming-invoice/incoming-invoice.component';
import { IncomingInvoiceListComponent } from './incoming-invoice-list/incoming-invoice-list.component';
import { CancellationViewComponent } from './cancellation-view/cancellation-view.component';
import { ImagepopupComponent } from './cancellation-view/imagepopup/imagepopup.component';
// Refund and SalesReturn
import { RefundOrderRequestComponent } from './refund-order/refund-order-request/refund-order-request.component';
import { RefundOrderComponent } from './refund-order/refund-order.component';
import { RefundOrderCreatedComponent } from './refund-order/refund-order-created/refund-order-created.component';
import { RefundListComponent } from './refund-list/refund-list.component';
import { RefundListGridComponent } from './refund-list/refund-list-grid/refund-list-grid.component';
import { RefundCreatedListGridComponent } from './refund-list/refund-created-list-grid/refund-created-list-grid.component';
import { CustomerListComponent } from './refund-order/customer-list/customer-list.component';
import { ImageListComponent } from './refund-order/image-list/image-list.component'; 
import { RemarkListComponent } from './refund-order/remark-list/remark-list.component';
import { SalesReturnRequestComponent } from './sales-return/sales-return-request/sales-return-request.component';
import { SalesReturnComponent } from './sales-return/sales-return.component';
import { SalesReturnListComponent } from './sales-return-list/sales-return-list.component';
import { SalesListGridComponent } from './sales-return-list/sales-list-grid/sales-list-grid.component';
import { SalesCreatedListGridComponent } from './sales-return-list/sales-created-list-grid/sales-created-list-grid.component';
import { ItemListComponent } from './sales-return/item-list/item-list.component';
import { SalesReturnCreatedComponent } from './sales-return/sales-return-created/sales-return-created.component';
import { CancellationComponent } from './cancellation/cancellation.component';
import { CancelAdvanceComponent } from './cancellation/cancel-advance/cancel-advance.component';
import { CreditRequestComponent } from './credit-request/credit-request.component';
import { UnclaimedDeviceComponent } from './unclaimed-device/unclaimed-device.component';
import { UnclaimedDeviceListComponent } from './unclaimed-device/unclaimed-device-list/unclaimed-device-list.component';
import { UnclaimedDeviceGridComponent } from './unclaimed-device/unclaimed-device-list/unclaimed-device-grid/unclaimed-device-grid.component';
import { InvoicePaymentChangeComponent } from './accessory-sales/invoice-payment-change/invoice-payment-change.component';
import { BulletinBoardComponent } from './bulletin-board/bulletin-board.component';
import { LeadManagementListComponent } from './lead-management-list/lead-management-list.component';
import { LeadManagementComponent } from './lead-management/lead-management.component';
import { DiscountKittyComponent } from './discount-kitty/discount-kitty.component';
import { AddDiscountKittyComponent } from './discount-kitty/add-discount-kitty/add-discount-kitty.component';
import { DropoffManagementListComponent } from './dropoff-management-list/dropoff-management-list.component';
import { DropoffManagementComponent } from './dropoff-management/dropoff-management.component';
import { ConsignmentScanComponent } from './consignment-scan/consignment-scan.component';
import { DropoffManagementGridComponent } from './dropoff-management-list/dropoff-management-grid/dropoff-management-grid.component';
import { EscalationTrackerListComponent } from './escalation-tracker-list/escalation-tracker-list.component';
import { EscalationTrackerComponent } from './escalation-tracker/escalation-tracker.component';
import { NretManagementComponent } from './nret-management/nret-management.component';
import { NretManagementListComponent } from './nret-management/nret-management-list/nret-management-list.component';
import { AppleRegistryComponent } from './apple-registry/apple-registry.component';
import { AppleRegistryListComponent } from './apple-registry/apple-registry-list/apple-registry-list.component';
import { NretManagementGridComponent } from './nret-management/nret-management-list/nret-management-grid/nret-management-grid.component';
import { AppleRegistryGridComponent } from './apple-registry/apple-registry-list/apple-registry-grid/apple-registry-grid.component';
import { AddBulletinBoardComponent } from './bulletin-board/add-bulletin-board/add-bulletin-board.component';
import { HappyCallingComponent } from './happy-calling/happy-calling.component';
import { HappyCallingListComponent } from './happy-calling/happy-calling-list/happy-calling-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule} from '@angular/material/expansion';
import { DiscountKittyApprovalComponent } from './discount-kitty-approval/discount-kitty-approval.component';
import { AddDiscountKittyApprovalComponent } from './discount-kitty-approval/add-discount-kitty-approval/add-discount-kitty-approval.component';
import { ConsignmentPendingListComponent } from './consignment-pending-list/consignment-pending-list.component';
import { AddConsignmentPendingListComponent } from './consignment-pending-list/add-consignment-pending-list/add-consignment-pending-list.component';
import { ReturnUnclaimedDeviceComponent } from './unclaimed-device/return-unclaimed-device/return-unclaimed-device.component';
import { BulkReturnOrderDcListComponent } from './bulk-return-order-dc-list/bulk-return-order-dc-list.component';
import { BulkReturnOrderDcGridComponent } from './bulk-return-order-dc-list/bulk-return-order-dc-grid/bulk-return-order-dc-grid.component';
import { CreateBulkReturnDcComponent } from './bulk-return-order-dc-list/create-bulk-return-dc/create-bulk-return-dc.component';
import { GsxkbbpartListComponent } from './gsxkbbpart-list/gsxkbbpart-list.component';
import { CallManagementComponent } from './call-management/call-management.component';
import { CallManagementListComponent } from './call-management-list/call-management-list.component';
import { AmcContractManagementListComponent } from './amc-contract-management-list/amc-contract-management-list.component';
import { CompanyStockManagementComponent } from './company-stock-management/company-stock-management.component';
import { TradeinListComponent } from './tradein-list/tradein-list.component';
import { TradeinComponent } from './tradein-list/tradein/tradein.component';
import { TestingComponent } from './testing/testing.component';

@NgModule({
  declarations: [

    PartSelectorComponent,
      StockOrderComponent,
      ConsignmentDeliveryComponent,
      BulkReturnOrderComponent,
      BulkPartSelectorComponent,
      OrderSummaryListComponent,
      PendingAcknowledgeComponent,
      BulkReturnListComponent,
      BulkReturnGridComponent,
      ConsignmentOrderListComponent,
      OpeningStockComponent,
      OpeningStockListComponent,
      AccessorySalesComponent,
      GoodsMovementComponent,
      GoodsMovementListComponent,
      StockTransferOrderComponent,
      StockTransferOrderListComponent,
      InvoiceSalesStockSelectorComponent,
      AccessorySalesListComponent,
      SalesReturnListComponent,
      SalesReturnComponent,
      SalesReturnRequestComponent,
      RefundListComponent,
      RefundOrderComponent,
      RefundOrderRequestComponent,
      RefundOrderCreatedComponent,
      DiscountCouponListComponent,
      DiscountCouponComponent,
      ImageListComponent,
      RemarkListComponent,
      CustomerListComponent,
      ItemListComponent,
      SalesListGridComponent,
      RefundListGridComponent,
      SalesCreatedListGridComponent,
      RefundCreatedListGridComponent,
      AdvancePaymentComponent,
      AdvancePaymentListComponent,
      CashDepositComponent,
      SalesReturnCreatedComponent,
      CashDepositListComponent,
      IncomingInvoiceComponent,
      IncomingInvoiceListComponent,
      CancellationComponent,
      CancelAdvanceComponent,
      CreditRequestComponent,
      UnclaimedDeviceComponent,
      UnclaimedDeviceListComponent,
      UnclaimedDeviceGridComponent,
      InvoicePaymentChangeComponent,
      BulletinBoardComponent,
      AddBulletinBoardComponent,
      LeadManagementListComponent,
      LeadManagementComponent,
      DiscountKittyComponent,
      AddDiscountKittyComponent,
      DropoffManagementListComponent,
      DropoffManagementComponent,
      ConsignmentScanComponent,
      DropoffManagementGridComponent,
      EscalationTrackerListComponent,
      EscalationTrackerComponent,
      NretManagementComponent,
      NretManagementListComponent,
      AppleRegistryComponent,
      AppleRegistryListComponent,
      NretManagementGridComponent,
      AppleRegistryGridComponent,
      CancellationViewComponent,
      ImagepopupComponent,
      HappyCallingComponent,
      HappyCallingListComponent,
      DiscountKittyApprovalComponent,
      AddDiscountKittyApprovalComponent,
      ConsignmentPendingListComponent,
      AddConsignmentPendingListComponent,
      ReturnUnclaimedDeviceComponent,
      BulkReturnOrderDcListComponent,
      BulkReturnOrderDcGridComponent,
      CreateBulkReturnDcComponent,
      GsxkbbpartListComponent,
      CallManagementComponent,
      CallManagementListComponent,
      AmcContractManagementListComponent,
      CompanyStockManagementComponent,
      TradeinListComponent,
      TradeinComponent,
      TestingComponent

  ],


  imports: [
    CommonModule,
    SptonSharedModule,
    NgSelectModule,
    NitcControlModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ScrollingModule,
    NgxSpinnerModule,
    MatExpansionModule,
    MatCardModule

  ],

})
export class InventoryModule { }
